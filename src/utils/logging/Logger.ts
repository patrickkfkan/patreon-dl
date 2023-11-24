export type LogLevel = 'info' | 'debug' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel,
  originator?: string,
  message: any[]
}

export default abstract class Logger {
  abstract log(entry: LogEntry): void;

  end(): Promise<void> {
    return Promise.resolve();
  }
}

export function commonLog(
  logger: Logger | null | undefined,
  level: LogLevel,
  originator: string | null | undefined,
  ...message: any[]) {

  if (logger) {
    logger.log({
      level,
      originator: originator || undefined,
      message
    });
  }
}
