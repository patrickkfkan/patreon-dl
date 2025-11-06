import ObjectHelper from '../utils/ObjectHelper.js';
import Parser from './Parser.js';

export default class PageParser extends Parser {

  protected name = 'PageParser';

  parseInitialData(html: string, _url: string) {
    this.log('debug', `Parse initial data from ${_url}`);

    const initialDataRegex = /window\.patreon\s*?=\s*?({.+?});/gm;
    const initialDataRegex2 = /<script id="__NEXT_DATA__" type="application\/json">(.+)<\/script>/gm;

    this.log('debug', `Trying pattern: ${initialDataRegex}`);
    const match = initialDataRegex.exec(html);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      }
      catch (error: any) {
        throw Error(`Parse error: ${error instanceof Error ? error.message : error}`);
      }
    }
    this.log('debug', `No match for pattern: ${initialDataRegex}`);

    this.log('debug', `Trying pattern: ${initialDataRegex2}`);
    const match2 = initialDataRegex2.exec(html);
    if (match2 && match2[1]) {
      try {
        const parsed = JSON.parse(match2[1]);
        return ObjectHelper.getProperty(parsed, 'props.pageProps.bootstrapEnvelope');
      }
      catch (error: any) {
        throw Error(`Parse error: ${error instanceof Error ? error.message : error}`);
      }
    }
    this.log('debug', `No match for pattern: ${initialDataRegex2}`);

    this.log('debug', 'Check Next.js streaming response');
    const isNextJSStreamingResponse = html.includes('self.__next_f.push');
    if (isNextJSStreamingResponse) {
      this.log('debug', 'Detected Next.js streaming response');

      let currentUserId: string | null = null;
      for (const { data: currentUser } of this.#extractJsonFromKey(html, 'currentUser')) {
        if (currentUser) {
          currentUserId = ObjectHelper.getProperty(currentUser, 'data.id');
          if (currentUserId) {
            break;
          }
        }
      }
      if (!currentUserId) {
        const matchCurrentUserNullRegex = /\\"currentUser\\"\s*:\s*null/g;
        const matchCurrentUserNull = matchCurrentUserNullRegex.exec(html);
        if (!matchCurrentUserNull) {
          throw Error(`Failed to obtain initial data - "currentUserId" not found in Next.js streaming response`);
        }
      }

      const campaignIdRegex = /campaign_id\\",\\"unit_id\\":\\"(.+?)\\"/gm;
      this.log('debug', `Trying pattern in Next.js streaming response: ${campaignIdRegex}`);
      const campaignIdMatch = campaignIdRegex.exec(html);
      if (!campaignIdMatch || !campaignIdMatch[1]) {
        throw Error(`Initial data not found - no match for pattern in Next.js streaming response: ${campaignIdRegex}`);
      }

      const campaignId = campaignIdMatch ? campaignIdMatch[1] : undefined;
      return {
        pageBootstrap: {
          campaign: {
            data: {
              id: campaignId
            }
          }
        },
        commonBootstrap: {
          currentUser: {
            data: {
              id: currentUserId === null || currentUserId === 'null' ? undefined : currentUserId
            }
          }
        }
      };
    }

    throw Error('Initial data not found - no regex matches');
  }

  *#extractJsonFromKey(input: string, key: string) {
    const keyPattern = `\\\\"${key}\\\\"\\s*:\\s*{`;
    const keyRegex = new RegExp(keyPattern, 'g');

    let match;
    while ((match = keyRegex.exec(input)) !== null) {
      const start = match.index + match[0].length - 1; // position of opening {
      let end = start;
      let braceCount = 1;

      while (end < input.length && braceCount > 0) {
        end++;
        if (input[end] === '{') braceCount++;
        if (input[end] === '}') braceCount--;
      }

      const jsonFragment = input.slice(start, end + 1).replaceAll('\\', '');
      try {
        yield {
          data: JSON.parse(jsonFragment)
        };
      } catch (error) {
        this.log('debug', 'Error parsing JSON fragment:', error);
        yield {
          data: null,
        };
      }
    }
  }
}
