import { EOL } from 'os';
import path from 'path';
import fs from 'fs';
import PromptSync from 'prompt-sync';
import FSHelper from '../../utils/FSHelper.js';
import YouTubeCredentialsCapturer from '../../utils/YouTubeCredentialsCapturer.js';

export default class YouTubeConfigurator {

  static async start(ytCredsPath: string) {
    const prompt = PromptSync({ sigint: true });

    console.log(`Welcome to patreon-dl YouTube Configurator!

If you have a YouTube Premium subscription, connecting patreon-dl to your
YouTube account will allow it to download embedded YouTube videos at
qualities available only to Premium subscribers, such as '1080p Premium'.

This script begins the YouTube connection process. During this process,
YouTube credentials are captured and saved to:

"${ytCredsPath}".

When patreon-dl starts, the credentials will be loaded and used for
authenticating access to Premium-quality YouTube streams.

What would you like to do?
1. Connect to YouTube
2. Revoke existing YouTube credentials
`);

    const connectOrRevoke = this.#promptInput<'connect' | 'revoke'>(
      prompt,
      'Enter your choice (1-2): ',
      [ '1', '2' ],
      [ 'connect', 'revoke' ]);

    if (connectOrRevoke === 'connect') {
      return await this.#startConnect(ytCredsPath, prompt);
    }

    return this.#revokeCredentials(ytCredsPath);
  }

  static async #startConnect(ytCredsPath: string, prompt: PromptSync.Prompt) {
    if (fs.existsSync(ytCredsPath)) {
      console.log('YouTube credentials file already exists. Proceeding will overwrite it.');
      const overwriteOrExit = this.#promptInput<'overwrite' | 'exit'>(
        prompt,
        'Proceed (y/N)? ',
        [ 'y', 'n' ],
        [ 'overwrite', 'exit' ],
        'exit'
      );
      if (overwriteOrExit === 'exit') {
        console.log('Bye!');
        return 0;
      }
    }
    const code = await this.#doConnectAndSaveCredentials(ytCredsPath);
    if (code === 0) {
      console.log('YouTube connection process completed successfully.');
    }
    else {
      console.log('YouTube connection process ended with error.');
    }
    return code;
  }

  static #doConnectAndSaveCredentials(ytCredsPath: string) {
    return new Promise<number>(async (resolve) => {
      const capturer = new YouTubeCredentialsCapturer();
      capturer.on('pending', (data) => {
        console.log(`In a browser, go to the following Verification URL and enter Code:

- Verification URL: ${data.verificationURL}
- Code: ${data.code}

Then wait for this script to complete.
`);
      });

      capturer.on('capture', (credentials) => {
        try {
          FSHelper.createDir(path.parse(ytCredsPath).dir);
          FSHelper.writeFile(ytCredsPath, JSON.stringify(credentials));
          console.log(`YouTube connected; credentials saved to "${ytCredsPath}"`, EOL);
          resolve(0);
        }
        catch (error) {
          console.error(`Error saving credentials to "${ytCredsPath}": `, error instanceof Error ? error.message : error, EOL);
          resolve(1);
        }
      });

      await capturer.begin();
    });
  }

  static #revokeCredentials(ytCredsPath: string) {
    if (fs.existsSync(ytCredsPath)) {
      try {
        FSHelper.unlink(ytCredsPath);
        console.log(`Deleted "${ytCredsPath}"`);
        return 0;
      }
      catch (error) {
        console.error(`Error deleting "${ytCredsPath}": `, error instanceof Error ? error.message : error);
        return 1;
      }
    }
    console.log(`No credentials found: "${ytCredsPath}" does not exist.`);
    return 0;
  }


  static #promptInput<T>(prompt: PromptSync.Prompt, message: string, acceptValues: string[], retValues: T[], defaultValue?: T): T {
    const input = prompt(message).trim().toLowerCase();
    if (!input && defaultValue !== undefined) {
      console.log('');
      return defaultValue;
    }
    const acceptIndex = acceptValues.indexOf(input);
    if (acceptIndex >= 0) {
      console.log('');
      return retValues[acceptIndex];
    }
    return this.#promptInput(prompt, message, acceptValues, retValues);
  }
}