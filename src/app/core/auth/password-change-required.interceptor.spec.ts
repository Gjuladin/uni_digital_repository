import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';

import { FirstLoginFlowService } from './first-login-flow.service';
import { PasswordChangeRequiredInterceptor } from './password-change-required.interceptor';

describe('PasswordChangeRequiredInterceptor', () => {
  let router: jasmine.SpyObj<Router>;
  let firstLoginFlow: FirstLoginFlowService;
  let interceptor: PasswordChangeRequiredInterceptor;
  let handler: HttpHandler;

  beforeEach(() => {
    router = jasmine.createSpyObj('router', ['navigate']);
    firstLoginFlow = new FirstLoginFlowService();
    interceptor = new PasswordChangeRequiredInterceptor(router, firstLoginFlow);
    handler = {
      handle: () => throwError(() => new HttpErrorResponse({
        status: 403,
        error: { code: 'PASSWORD_CHANGE_REQUIRED' },
      })),
    };
  });

  it('redirects a genuinely gated request', () => {
    interceptor.intercept(new HttpRequest('GET', '/api/core/sites'), handler).subscribe({ error: () => undefined });

    expect(router.navigate).toHaveBeenCalledWith(['/change-password']);
  });

  it('ignores a late gated response after the password change committed', () => {
    firstLoginFlow.markPasswordChanged('user-id');

    interceptor.intercept(new HttpRequest('GET', '/api/core/sites'), handler).subscribe({ error: () => undefined });

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
