#!/usr/bin/env node

/**
 * External downloader for embedded SproutVideo videos. Obtains the appropriate URL to download from and
 * passes it to 'yt-dlp' (https://github.com/yt-dlp/yt-dlp).
 * 
 * Usage
 * -----
 * Place the following two lines in your 'patreon-dl' config file:
 *
 * [embed.downloader.sproutvideo]
 * exec = patreon-dl-sprout -o "{dest.dir}/%(title)s.%(ext)s" --embed-html "{embed.html}" --embed-url "{embed.url}"
 * 
 * You can append the following additional options to the exec line if necessary:
 * --video-password "<password>": for password-protected videos
 * --yt-dlp "</path/to/yt-dlp>": if yt-dlp is not in the PATH
 * 
 * You can pass options directly to yt-dlp. To do so, add '--' to the end of the exec line, followed by the options.
 * For example:
 * exec = patreon-dl-sprout -o "{dest.dir}/%(title)s.%(ext)s" --embed-html "{embed.html}" --embed-url "{embed.url}" -- --cookies-from-browser firefox
 * 
 * Upon encountering a post with embedded SproutVideo content, 'patreon-dl' will call this script, which in turn proceeds to download through SproutVideoDownloader
 * (see the parent class EmbedlyDownloader for more info).
 */

import EmbedlyDownloader from './EmbedlyDownloader.js';

class SproutVideoDownloader extends EmbedlyDownloader {
  constructor() {
    super('SproutVideo', 'videos.sproutvideo.com');
  }
}

(async () => {
  const downloader = new SproutVideoDownloader();
  try {
    process.exit(await downloader.start());
  }
  catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
})();