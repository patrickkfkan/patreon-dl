import Parser from './Parser.js';

const INITIAL_DATA_REGEX = /window\.patreon.*?=.*?({.+?});/gm;

export default class PageParser extends Parser {

  protected name = 'PageParser';

  parseInitialData(html: string, _url: string) {
    this.log('debug', `Parse initial data from ${_url}`);
    this.log('debug', `Match pattern: ${INITIAL_DATA_REGEX}`);
    const match = INITIAL_DATA_REGEX.exec(html);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      }
      catch (error) {
        throw Error(`Parse error: ${error instanceof Error ? error.message : error}`);
      }
    }
    throw Error(`No matches found for pattern: ${INITIAL_DATA_REGEX}`);
  }
}
