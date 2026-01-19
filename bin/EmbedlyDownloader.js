import parseArgs from 'yargs-parser';
import spawn from '@patrickkfkan/cross-spawn';
import path from 'path';

/**
  * EmbedlyDownloader uses yt-dlp to download content embedded through Embedly:
  * - It obtains the video URL from 'embed.html' or 'embed.url' commandline args.
  *   The former ("player URL") is always preferable since it is what's actually played within
  *   the Patreon post, and furthermore 'embed.url' sometimes returns "Page not found" (see
  *   issue: https://github.com/patrickkfkan/patreon-dl/issues/65) or a password-protected page.
  * - The URL is passed to yt-dlp.
  * - yt-dlp downloads the video from URL and saves it to 'dest.dir'. The filename is determined by the specified
  *   format '%(title)s.%(ext)s' (see: https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#output-template).
  * - Fallback to embed URL if player URL fails to download.
 */

export default class EmbedlyDownloader {

  /**
   * 
   * @param {*} provider Name of the provider.
   * @param {*} srcHostname Hostname of the embedded source URL.
   */
  constructor(provider, srcHostname) {
    this.provider = provider;
    this.srcHostname = srcHostname;
  }

  getPlayerURL(html) {
    if (!html) {
      return null;
    }

    const regex = /src="(\/\/cdn.embedly.com\/widgets.+?)"/g;
    const match = regex.exec(html);
    if (match && match[1]) {
      const embedlyURL = match[1];
      console.log('Found Embedly URL from embed HTML:', embedlyURL);
      let embedlySrc;
      try {
        const urlObj = new URL(`https:${embedlyURL}`);
        embedlySrc = urlObj.searchParams.get('src');
      }
      catch (error) {
        console.error('Error parsing Embedly URL:', error);
      }
      try {
        const embedlySrcObj = new URL(embedlySrc);
        if (!this.srcHostname) {
          console.log(`Got Embedly src "${embedlySrc}" - assume it is ${this.provider} player URL since no hostname was specified`);
        }
        else if (embedlySrcObj.hostname === this.srcHostname) {
          console.log(`Got ${this.provider} player URL from Embedly src: ${embedlySrc}`);
        }
        else {
          console.warn(`Embedly src "${embedlySrc}" does not correspond to ${this.provider} player URL`);
        }
        return embedlySrc;
      }
      catch (error) {
        console.error(`Error parsing Embedly src "${embedlySrc}":`, error);
      }
    }

    return null;
  }

  getCommandString(cmd, args) {
    const quotedArgs = args.map((arg) => arg.includes(' ') ? `"${arg}"` : arg);
    return [
      cmd,
      ...quotedArgs
    ].join(' ');
  }

  async download(url, o, videoPassword, ytdlpPath, ytdlpArgs) {
    let proc;
    const ytdlp = ytdlpPath || 'yt-dlp';
    const parsedYtdlpArgs = parseArgs(ytdlpArgs);
    try {
      return await new Promise((resolve, reject) => {
        let settled = false;
        const args = [];
        if (!parsedYtdlpArgs['o'] && !parsedYtdlpArgs['output']) {
          args.push('-o', o);
        }
        if (!parsedYtdlpArgs['referrer']) {
          args.push('--add-header', 'Referer: https://patreon.com/');
        }
        args.push(...ytdlpArgs);
        const printArgs = [...args];
        if (videoPassword && !parsedYtdlpArgs['video-password']) {
          args.push('--video-password', videoPassword);
          printArgs.push('--video-password', '******');
        }
        args.push(url);
        printArgs.push(url);

        console.log(`Command: ${this.getCommandString(ytdlp, printArgs)}`);
        proc = spawn(ytdlp, args);

        proc.stdout?.on('data', (data) => {
          console.log(data.toString());
        });

        proc.stderr?.on('data', (data_1) => {
          console.error(data_1.toString());
        });

        proc.on('error', (err) => {
          if (settled) {
            return;
          }
          settled = true;
          reject(err);
        });

        proc.on('exit', (code) => {
          if (settled) {
            return;
          }
          settled = true;
          resolve(code);
        });
      });
    } finally {
      if (proc) {
        proc.removeAllListeners();
        proc.stdout?.removeAllListeners();
        proc.stderr?.removeAllListeners();
      }
    }
  }

  async start() {
    const args = parseArgs(process.argv.slice(2));
    const {
      'o': _o,
      'embed-html': _embedHTML,
      'embed-url': _embedURL,
      'video-password': videoPassword,
      'yt-dlp': _ytdlpPath
    } = args;
    const o = _o?.trim() ? path.resolve(_o.trim()) : null;
    const embedHTML = _embedHTML?.trim();
    const embedURL = _embedURL?.trim();
    const ytdlpPath = _ytdlpPath?.trim() ? path.resolve(_ytdlpPath.trim()) : null;
    const ytdlpArgs = args['_'];

    if (!o) {
      throw Error('No output file specified');
    }

    if (!embedHTML && !embedURL) {
      throw Error('No embed HTML or URL provided');
    }

    const _url = this.getPlayerURL(embedHTML) || embedURL;

    if (!_url) {
      throw Error(`Failed to obtain video URL`);
    }

    console.log(`Going to download video from "${_url}"`);
    let code = await this.download(_url, o, videoPassword, ytdlpPath, ytdlpArgs);
    if (code !== 0 && _url !== embedURL && embedURL) {
      console.log(`Download failed - retrying with embed URL "${embedURL}"`);
      return await this.download(embedURL);
    }

    return code;
  }
}
