import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
// Import your logger service
import { environment } from 'src/environments/environment';
import { LoggerService } from '../services/logger.service';

import * as CryptoJS from 'crypto-js';

@Injectable()
export class AuthInterceptorInterceptor implements HttpInterceptor {
  token: any = '';
  BACKEND_URL: any = environment.apiUrl;
  isLoggedIn: any = undefined;
  constructor(
    private logger: LoggerService // Import the logger service
  ) {}

  async geJwtToken() {
    try {
      const encryptedtoken: any = localStorage.getItem('jwt');
      const decryptedToken = CryptoJS.AES.decrypt(
        encryptedtoken,
        'encryptionKey'
      ).toString(CryptoJS.enc.Utf8);
      this.token = decryptedToken;
      console.log('token intercept', this.token);
    } catch (error) {
      console.error('Error retrieving JWT token:', error);
    }
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return new Observable<HttpEvent<any>>((observer) => {
      const handleRequest = async () => {
        if (!this.isLoggedIn) {
          this.isLoggedIn = localStorage.getItem('IsLoggedIn') === 'true';
          if (this.isLoggedIn) {
            await this.geJwtToken();
          }
        }

        if (this.token) {
          request = request.clone({
            setHeaders: { Authorization: `${this.token}` },
          });
        }

        next.handle(request).subscribe(
          (event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              // Log successful response
              this.logger.log(
                `${request.method} ${request.urlWithParams} - ${event.status} ${
                  event.statusText
                } ${JSON.stringify(event.body)}`
              );
              // Log response content
              this.logger.log('Response Content:', event.body);
            }
            observer.next(event);
          },
          (error) => {
            if (error instanceof HttpErrorResponse) {
              // Log error response
              this.logger.error(
                `${request.method} ${request.urlWithParams} - ${error.status} ${error.statusText}`
              );
            }
            observer.error(error);
          },
          () => {
            observer.complete();
          }
        );
      };

      handleRequest();
    });
  }
}
