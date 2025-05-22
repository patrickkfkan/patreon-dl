import { type ChildProcess } from 'child_process';
import { type PostEmbed } from '../../entities/Post.js';
import Formatter from '../../utils/Formatter.js';
import URLHelper from '../../utils/URLHelper.js';
import {type LogLevel} from '../../utils/logging/Logger.js';
import type Logger from '../../utils/logging/Logger.js';
import { type EmbedDownloader } from '../DownloaderOptions.js';
import DownloadTask, { type DownloadTaskCallbacks, type DownloadTaskParams } from './DownloadTask.js';
import spawn from '@patrickkfkan/cross-spawn';
import split from 'argv-split'; // Switched from 'string-argv' which does not split nested quotes properly
import { type DownloaderConfig } from '../Downloader.js';

export interface ExternalDownloaderTaskParams extends DownloadTaskParams {
  name: string;
  exec: {
    command: string;
    args: string[];
  };
}

export default class ExternalDownloaderTask extends DownloadTask {

  protected name: string;

  #exec: ExternalDownloaderTaskParams['exec'];
  #proc: ChildProcess | null;
  #abortController: AbortController | null;
  #abortingCallback: (() => void) | null;

  constructor(params: ExternalDownloaderTaskParams) {
    super(params);
    this.#exec = params.exec;
    this.#abortController = null;
    this.#abortingCallback = null;
    this.#proc = null;
    this.name = params.name;
  }

  protected resolveDestPath() {
    return Promise.resolve('(not applicable)');
  }  

  protected doStart() {
    return new Promise<void>((resolve) => {

      if (this.status === 'aborted') {
        resolve();
        return;
      }

      try {
        this.#abortController = new AbortController();
        const commandStr = this.#getCommandString();

        if (this.dryRun) {
          this.notifyStart();
          this.log('debug', `(dry-run) -> Skip command "${commandStr}"`);
          this.notifyComplete();
          resolve();
          return;
        }

        this.log('debug', `Going to execute "${commandStr}"`);
        const proc = spawn(this.#exec.command, this.#exec.args);
        this.log('debug', `[pid: ${proc.pid}] Exec "${commandStr}"`);
        let resolved = false;
        let lastErrMsg: string | null = null;

        proc.stdout?.on('data', (data) => {
          this.log('debug', `[pid ${proc.pid}] stdout:`, data.toString());
        });

        proc.stderr?.on('data', (data) => {
          this.log('warn', `[pid ${proc.pid}] stderr:`, data.toString());
          lastErrMsg = data;
        });

        proc.on('error', (err) => {
          resolved = true;
          if (this.#abortingCallback) {
            this.#abortingCallback();
            return;
          }
          this.notifyError(err);
          resolve();
        });

        proc.on('exit', (code, signal) => {
          if (resolved) {
            return;
          }
          resolved = true;
          if (this.#abortingCallback) {
            this.log('debug', `[pid: ${proc.pid}] Process exit due to abort`);
            this.#abortingCallback();
            return;
          }
          const signalStr = signal !== null ? `; signal: ${signal}` : '';
          this.log('debug', `[pid: ${proc.pid}] Process exit (code: ${code}${signalStr})`);
          if (code === 0) {
            this.notifyComplete();
          }
          else {
            const e = lastErrMsg ? `. Last captured error message: ${lastErrMsg}` : '';
            this.notifyError(`Process failed with exit code ${code} (pid: ${proc.pid})${e}`);
          }
          resolve();
        });

        this.#proc = proc;
        this.notifyStart();

        this.#abortController.signal.onabort = () => {
          if (proc.pid) {
            proc.kill('SIGKILL');
          }
          else if (this.#abortingCallback) {
            this.#abortingCallback();
            resolve();
          }
        };
      }
      catch (error: any) {
        if (this.#abortingCallback) {
          this.#abortingCallback();
          return;
        }
        this.notifyError(error);
        resolve();
      }
    })
      .finally(() => {
        if (this.#proc) {
          this.#proc.removeAllListeners();
          this.#proc.stdout?.removeAllListeners();
          this.#proc.stderr?.removeAllListeners();
          this.#proc = null;
        }
        this.#abortController = null;
      });
  }

  protected async doAbort() {
    return new Promise<void>((resolve) => {
      if (this.#abortController) {
        this.#abortingCallback = () => {
          this.#abortingCallback = null;
          this.notifyAbort();
          resolve();
        };
        this.#abortController.abort();
      }
      else {
        resolve();
      }
    });
  }

  protected async doDestroy() {
    this.#proc?.removeAllListeners();
    this.#proc = null;
    return Promise.resolve();
  }

  protected doGetProgress() {
    return undefined;
  }

  #getCommandString() {
    const quotedArgs = this.#exec.args.map((arg) => {
      const _arg = arg.trim();
      if (_arg.startsWith('"') && _arg.endsWith('"')) {
        return _arg;
      }
      if (_arg.includes('=') && _arg.startsWith('-')) {
        const equalPosition = _arg.indexOf('=');
        const argKey = _arg.substring(0, equalPosition);
        let argValue = _arg.substring(equalPosition);
        if (argValue.includes(' ')) {
          argValue = `"${argValue}"`;
        }
        return `${argKey}=${argValue}`;
      }
      if (_arg.includes(' ')) {
        return `"${_arg}"`;
      }
      return _arg;
    });
    return [
      this.#exec.command,
      ...quotedArgs
    ].join(' ');
  }

  static fromEmbedDownloader(
    config: DownloaderConfig<any>,
    dl: EmbedDownloader,
    embed: PostEmbed,
    destDir: string,
    callbacks: DownloadTaskCallbacks | null,
    logger: Logger | null | undefined
  ) {
    if (!embed.url) {
      return null;
    }
    const originator = `embed.downloader.${embed.provider}`;
    const __log = (level: LogLevel, ...message: any[]) => {
      logger?.log({
        level,
        originator,
        message
      });
    };
    if (!URLHelper.validateURL(embed.url)) {
      __log('warn', `Could not create task: invalid URL "${embed.url}"`);
      return null;
    }
    const dict = {
      'post.id': embed.postId,
      'post.url': embed.postURL,
      'embed.provider': embed.provider,
      'embed.provider.url': embed.providerURL,
      'embed.url': embed.url,
      'embed.subject': embed.subject,
      'embed.html': embed.html,
      'cookie': config.cookie || '',
      'dest.dir': destDir
    };

    const args = split(dl.exec);
    const cmd = args.shift();
    if (!cmd) {
      __log('warn', 'Could not create task: no command specified');
      return null;
    }
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      const interpolated = Formatter.format(arg, dict).result.trim();
      if (!interpolated && arg !== '{cookie}') {
        __log('warn', `Could not create task: got empty string for command arg '${arg}'`);
        return null;
      }
      args[i] = interpolated;
    }

    return new ExternalDownloaderTask({
      name: originator,
      exec: {
        command: cmd,
        args
      },
      config,
      callbacks,
      logger,
      src: embed.url,
      srcEntity: embed
    });
  }
}
