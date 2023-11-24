import Logger, { LogEntry } from '../../utils/logging/Logger.js';

export default class ChainLogger extends Logger {

  #loggers: Logger[];

  constructor(loggers?: Logger[]) {
    super();
    this.#loggers = loggers || [];
  }

  add(logger: Logger) {
    this.#loggers.push(logger);
  }

  remove(logger: Logger) {
    const index = this.#loggers.findIndex((l) => l === logger);
    if (index >= 0) {
      this.#loggers.splice(index, 1);
    }
  }

  clear() {
    this.#loggers = [];
  }

  log(entry: LogEntry): void {
    for (const logger of this.#loggers) {
      logger.log(entry);
    }
  }

  async end(): Promise<void> {
    const endPromises = this.#loggers.map(async (logger) => {
      try {
        await logger.end();
      }
      catch (error) {
        // Do nothing
      }
    });
    await Promise.all(endPromises);
  }
}
