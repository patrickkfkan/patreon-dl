import ObjectHelper from '../utils/ObjectHelper.js';
import Parser from './Parser.js';

const INITIAL_DATA_REGEX = /window\.patreon\s*?=\s*?({.+?});/gm;
const INITIAL_DATA_REGEX_2 = /<script id="__NEXT_DATA__" type="application\/json">(.+)<\/script>/gm;

export default class PageParser extends Parser {

  protected name = 'PageParser';

  parseInitialData(html: string, _url: string) {
    this.log('debug', `Parse initial data from ${_url}`);

    this.log('debug', `Trying pattern: ${INITIAL_DATA_REGEX}`);
    const match = INITIAL_DATA_REGEX.exec(html);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      }
      catch (error) {
        throw Error(`Parse error: ${error instanceof Error ? error.message : error}`);
      }
    }
    this.log('debug', `No match for pattern: ${INITIAL_DATA_REGEX}`);

    this.log('debug', `Trying pattern: ${INITIAL_DATA_REGEX_2}`);
    const match2 = INITIAL_DATA_REGEX_2.exec(html);
    if (match2 && match2[1]) {
      try {
        const parsed = JSON.parse(match2[1]);
        return ObjectHelper.getProperty(parsed, 'props.pageProps.bootstrapEnvelope');
      }
      catch (error) {
        throw Error(`Parse error: ${error instanceof Error ? error.message : error}`);
      }
    }
    this.log('debug', `No match for pattern: ${INITIAL_DATA_REGEX_2}`);

    throw Error('Initial data not found - no regex matches');
  }
}
