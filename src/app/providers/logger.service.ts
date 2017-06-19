import { Injectable } from '@angular/core';

@Injectable()
export class LoggerService {

  constructor() { }

  info(message?: any, ...optionalParams: any[]) {
    console.info(message, ...optionalParams); // tslint:disable-line
  }

  log(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
  }

  error(message?: any, ...optionalParams: any[]) {
    console.error(message, ...optionalParams);
  }

  warning(message?: any, ...optionalParams: any[]) {
    console.warn(message, ...optionalParams);
  }

  debug(message?: any, ...optionalParams: any[]) {
    console.debug(message, ...optionalParams); // tslint:disable-line
  }
}
