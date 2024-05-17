#!/usr/bin/env node

/**
 * External downloader for embedded Vimeo videos. Obtains the appropriate URL to download from and
 * passes it to 'yt-dlp' (https://github.com/yt-dlp/yt-dlp).
 * 
 * Usage
 * -----
 * Place the following two lines in your 'patreon-dl' config file:
 *
 * [embed.downloader.vimeo]
 * exec = patreon-dl-vimeo -o "{dest.dir}/%(title)s.%(ext)s" --embed-html "{embed.html}" --embed-url "{embed.url}"
 * 
 * You can append the following additional options to the exec line if necessary:
 * --video-password "<password>": for password-protected videos
 * --yt-dlp "</path/to/yt-dlp>": if yt-dlp is not in the PATH
 * 
 * Upon encountering a post with embedded Vimeo content, 'patreon-dl' will call this script. The following then happens:
 * - This script obtains the video URL from 'embed.html' or 'embed.url'.
 * - The URL is passed to yt-dlp.
 * - yt-dlp downloads the video from URL and saves it to 'dest.dir'. The filename is determined by the specified
 *   format '%(title)s.%(ext)s' (see: https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#output-template).
 * 
 */

import parseArgs from 'yargs-parser';
import { spawn } from 'child_process';
import path from 'path';

function tryGetPlayerURL(html) {
  if (!html) {
    return null;
  }
  const regex = /https:\/\/player\.vimeo\.com\/video\/\d+/g;
  const match = regex.exec(html);
  if (match && match[0]) {
    return match[0];
  }
  return null;
}

function getCommandString(cmd, args) {
  const quotedArgs = args.map((arg) => arg.includes(' ') ? `"${arg}"` : arg);
  return [
    cmd,
    ...quotedArgs
  ].join(' ');
}

async function download(url, o, videoPassword, ytdlpPath) {
  let proc;
  const ytdlp = ytdlpPath || 'yt-dlp';
  try {
    return await new Promise((resolve, reject) => {
      let settled = false;
      const args = [
        '-f',
        'bv*+ba[acodec^=mp4a]',
        '-o',
        o
      ];
      const printArgs = [...args];
      if (videoPassword) {
        args.push('--video-password', videoPassword);
        printArgs.push('--video-password', '******');
      }
      args.push(url);
      printArgs.push(url);

      console.log(`Command: ${getCommandString(ytdlp, printArgs)}`);
      proc = spawn(ytdlp, args);

      proc.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      proc.stderr.on('data', (data_1) => {
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
    }
  }
}

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

if (!o) {
  console.error('No output file specified');
  process.exit(1);
}

if (!embedHTML && !embedURL) {
  console.error('No embed HTML or URL provided');
  process.exit(1);
}

const url = tryGetPlayerURL(embedHTML) || embedURL;

if (!url) {
  console.error(`Failed to obtain video URL`);
  process.exit(1);
}

console.log(`Going to download video from "${url}"`);

download(url, o, videoPassword, ytdlpPath).then((code) => {
  process.exit(code);
});
