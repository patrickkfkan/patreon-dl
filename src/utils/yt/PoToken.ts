import { BG, buildURL, GOOG_API_KEY } from 'bgutils-js';
import { type WebPoMinter } from 'bgutils-js/dist/core';
import { JSDOM } from 'jsdom';
import { type Dispatcher, fetch } from 'undici';

const requestKey = 'O43z0dpjhgX20SCx4KAo';

interface PoTokenMinterParams {
  minter: WebPoMinter;
  ttl: number;
  refreshThreshold: number;
  created: number;
}

export interface POTokenMinterWrapper {
  pot: (identifier: string) => Promise<string>;
  dispose: () => void;
}

export interface CreatePoTokenMinterOptions {
  proxyAgent?: Dispatcher;
}

export class PoTokenMinter {
  static createInstance(options: CreatePoTokenMinterOptions) {
    return createMinterWrapper(options);
  }
}

function createMinterWrapper(options: CreatePoTokenMinterOptions): POTokenMinterWrapper {
  let minterPromise: Promise<WebPoMinter>;
  let refreshTimer: NodeJS.Timeout | null = null;
  let disposed = false;

  function refresh() {
    if (disposed) {
      return;
    }
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    minterPromise = createMinter(options).then(({minter, ttl, refreshThreshold}) => {
      const timeout = ttl - refreshThreshold - 100;
      refreshTimer = setTimeout(() => {
        if (!disposed) {
          refresh();
        }
      }, timeout * 1000);
      return minter;
    });
  }

  refresh();

  return {
    async pot(identifier: string) {
      if (disposed) {
        throw Error('POTokenMinter disposed');
      }
      const minter = await minterPromise;
      return await minter.mintAsWebsafeString(identifier);
    },
    dispose() {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
      }
      disposed = true;
    }
  };
}

async function createMinter(options: CreatePoTokenMinterOptions): Promise<PoTokenMinterParams> {
  const dom = new JSDOM();
  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document
  });

  // Fetch challenge
  const challengeResponse = await fetch(buildURL('Create', true), {
    method: 'POST',
    headers: {
      'content-type': 'application/json+protobuf',
      'x-goog-api-key': GOOG_API_KEY,
      'x-user-agent': 'grpc-web-javascript/0.1'
    },
    body: JSON.stringify([requestKey]),
    dispatcher: options.proxyAgent
  });

  const unparsed = await challengeResponse.json() as Record<string, any>;
  const bgChallenge = BG.Challenge.parseChallengeData(unparsed);

  if (!bgChallenge) throw new Error('Could not get challenge');

  const interpreterJavascript =
    bgChallenge.interpreterJavascript
      .privateDoNotAccessOrElseSafeScriptWrappedValue;

  if (interpreterJavascript) {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(interpreterJavascript)();
  } else throw new Error('Could not load VM');

  // Create minter
  const botguard = await BG.BotGuardClient.create({
    globalName: bgChallenge.globalName,
    globalObj: globalThis,
    program: bgChallenge.program
  });

  const webPoSignalOutput: any[] = [];
  const botguardResponse = await botguard.snapshot({ webPoSignalOutput });

  const integrityTokenResponse = await fetch(buildURL('GenerateIT', true), {
    method: 'POST',
    headers: {
      'content-type': 'application/json+protobuf',
      'x-goog-api-key': GOOG_API_KEY,
      'x-user-agent': 'grpc-web-javascript/0.1'
    },
    body: JSON.stringify([requestKey, botguardResponse])
  });

  const response = (await integrityTokenResponse.json()) as [
    string,
    number,
    number,
    string
  ];

  if (typeof response[0] !== 'string')
    throw new Error('Could not get integrity token');

  const [integrityToken, estimatedTtlSecs, mintRefreshThreshold] = response;

  return {
    minter: await BG.WebPoMinter.create({ integrityToken }, webPoSignalOutput),
    ttl: estimatedTtlSecs,
    refreshThreshold: mintRefreshThreshold,
    created: Date.now()
  };
}