import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '@dspace/core/auth/auth.service';
import { EPerson } from '@dspace/core/eperson/models/eperson.model';
import { firstValueFrom, Observable, of } from 'rxjs';

import { passwordChangeRequiredGuard } from './password-change-required.guard';
import { FirstLoginFlowService } from './first-login-flow.service';

describe('passwordChangeRequiredGuard', () => {
  let user: EPerson | null;
  let external: boolean;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    user = null;
    external = false;
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({ redirected: true } as unknown as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: AuthService,
          useValue: {
            getAuthenticatedUserFromStoreIfAuthenticated: () => of(user),
            isExternalAuthentication: () => of(external),
          },
        },
      ],
    });
  });

  const runGuard = (url = '/home') => TestBed.runInInjectionContext(() =>
    firstValueFrom(passwordChangeRequiredGuard(
      {} as ActivatedRouteSnapshot,
      { url } as RouterStateSnapshot,
    ) as Observable<boolean | UrlTree>),
  );

  it('allows anonymous visitors', async () => {
    expect(await runGuard()).toBeTrue();
  });

  it('allows users who do not require a password change', async () => {
    user = { passwordChangeRequired: false } as EPerson;
    expect(await runGuard()).toBeTrue();
  });

  it('redirects a locally authenticated flagged user', async () => {
    user = { passwordChangeRequired: true } as EPerson;
    expect(await runGuard()).toBe(router.createUrlTree.calls.mostRecent().returnValue);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/change-password']);
  });

  it('does not gate external authentication sessions', async () => {
    user = { passwordChangeRequired: true } as EPerson;
    external = true;
    expect(await runGuard()).toBeTrue();
  });

  it('always permits the password-change page', () => {
    expect(TestBed.runInInjectionContext(() => passwordChangeRequiredGuard(
      {} as ActivatedRouteSnapshot,
      { url: '/change-password' } as RouterStateSnapshot,
    ))).toBeTrue();
  });

  it('does not send a successfully changed user back while entering the agreement', async () => {
    user = { id: 'user-id', passwordChangeRequired: true } as EPerson;
    TestBed.inject(FirstLoginFlowService).markPasswordChanged('user-id');

    expect(await runGuard('/info/end-user-agreement?redirect=%252Fhome')).toBeTrue();
  });

  it('does not bounce a successfully changed user back while leaving the agreement', async () => {
    user = { id: 'user-id', passwordChangeRequired: true } as EPerson;
    TestBed.inject(FirstLoginFlowService).markPasswordChanged('user-id');

    expect(await runGuard('/home')).toBeTrue();
  });
});
