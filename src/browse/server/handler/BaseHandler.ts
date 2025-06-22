import { type Request } from "express";
import { type UnionToTuple } from "../../../utils/Misc.js";
import {type LogLevel} from "../../../utils/logging/Logger.js";
import type Logger from "../../../utils/logging/Logger.js";
import { commonLog } from "../../../utils/logging/Logger.js";
import WebUtils from "../../../utils/WebUtils.js";

export default abstract class Basehandler {

  abstract name: string;
  #logger?: Logger | null;

  constructor(logger?: Logger | null) {
    this.#logger = logger;
  }

  getPaginationParams(req: Request, defaultItemsPerPage: number) {
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    return WebUtils.getPaginationParams(url, defaultItemsPerPage);
  }

  getQueryParamValue<T extends string>(
    req: Request,
    param: string,
    allowedValues: UnionToTuple<T>,
    defaultValue?: T
  ): T {
    const value = req.query[param];
    if (!value) {
      if (!defaultValue) {
        throw Error(`Invalid params: "${param}" missing`);
      }
      return defaultValue;
    }
    if (!allowedValues.includes(value)) {
      throw Error(`Invalid value "${value as string}" for param "${param}"`);
    }
    return value as T;
  }

  protected log(level: LogLevel, ...msg: any[]) {
    commonLog(this.#logger, level, this.name, ...msg);
  }
}