import express from 'express';
import path from 'path';
import fs from 'fs';
import DB from '../db/index.js';
import { type Server } from 'http';
import getPort from 'get-port';
import { type Logger } from '../../utils/logging/index.js';
import { getRouter } from './Router.js';
import API from '../api/index.js';

export const DEFAULT_WEB_SERVER_PORT = 3000;

export interface WebServerConfig {
  dataDir?: string;
  port?: number | null;
  logger?: Logger | null;
}

export class WebServer {
  name = 'WebServer';

  #config: WebServerConfig;
  #app: express.Express;
  #server: Server | null;
  #status: 'stopped' | 'started';
  #port: number | null;

  constructor(config: WebServerConfig) {
    this.#config = config;
    this.#app = express();
    this.#server = null;
    this.#status = 'stopped';
    this.#port = config.port || null;
  }

  async start() {
    if (this.#status === 'started') {
      return;
    }

    const dataDir = this.#config.dataDir || process.cwd();
    if (!fs.existsSync(dataDir)) {
      throw Error(`Data directory "${this.#config.dataDir}" does not exist`);
    }
    if (!fs.statSync(dataDir).isDirectory()) {
      throw Error(`"${this.#config.dataDir}" is not a directory`);
    }

    const dbFile = path.resolve(dataDir, '.patreon-dl', 'db.sqlite');
    if (!fs.existsSync(dbFile)) {
      throw Error(`DB file "${dbFile}" does not exist`);
    }
    const db = DB.getInstance(dbFile, false, this.#config.logger);
    const api = API.getInstance(db, this.#config.logger);
    const router = getRouter(db, api, dataDir, this.#config.logger);

    this.#app.use(express.json());
    this.#app.use(express.urlencoded({ extended: true }));
    this.#app.use('/assets', express.static(path.resolve(import.meta.dirname, '../web/assets')));
    this.#app.use('/themes', express.static(path.resolve(import.meta.dirname, '../web/themes')));
    this.#app.use('/images', express.static(path.resolve(import.meta.dirname, '../web/images')));
    this.#app.use(router);

    this.#port = await this.#getPort();

    return new Promise<void>((resolve, reject) => {
      this.#server = this.#app.listen(this.#port, (error) => {
        if (error) {
          reject(error);
          return;
        }
        this.#status = 'started';
        resolve();
      });
    });
  }

  stop() {
    if (this.#status === 'stopped') {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      if (this.#server) {
        this.#server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          this.#server = null;
          this.#port = null;
          this.#status = 'stopped';
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  #getPort() {
    if (typeof this.#config.port === 'number') {
      return this.#config.port;
    }
    return getPort({ port: DEFAULT_WEB_SERVER_PORT });
  }

  getConfig(): WebServerConfig {
    return {
      ...this.#config,
      port: this.#port
    };
  }
}
