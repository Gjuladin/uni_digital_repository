import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FirstLoginFlowService } from './first-login-flow.service';

/** Redirects users when the account-management API reports the forced-change gate. */
@Injectable()
export class PasswordChangeRequiredInterceptor implements HttpInterceptor {
  constructor(private router: Router, private firstLoginFlow: FirstLoginFlowService) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(catchError((error: HttpErrorResponse) => {
      const code = error?.error?.code || error?.error?.errorCode;
      if (error.status === 403 && code === 'PASSWORD_CHANGE_REQUIRED'
        && !request.url.endsWith('/me/password')
        && !this.firstLoginFlow.hasCompletedPasswordChange()) {
        void this.router.navigate(['/change-password']);
      }
      return throwError(() => error);
    }));
  }
}
