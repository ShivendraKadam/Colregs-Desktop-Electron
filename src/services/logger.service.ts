import { Injectable } from '@angular/core';
import { environment } from '../environments/environment'; // Adjust the path as needed

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  constructor() { }

  info(message: string, ...params: any[]) {
    if (environment.enableLogging) {

    }
  }

  error(message: string, ...params: any[]) {
    if (!environment.production && environment.enableLogging) {
      console.error(`[ERROR] ${message}`, ...params);
    }
  }

  warn(message: string, ...params: any[]) {
    if (!environment.production && environment.enableLogging) {
      console.warn(`[WARN] ${message}`, ...params);
    }
  }

  log(message: string, ...params: any[]) {
    if (!environment.production && environment.enableLogging) {

    }
  }

  // You can add more log levels and methods as needed
}
