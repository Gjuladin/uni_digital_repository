import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '@dspace/core/auth/auth.service';
import { combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { FirstLoginFlowService } from './first-login-flow.service';

/** Keeps a flagged local-password account on the password-change page. */
export const passwordChangeRequiredGuard: CanActivateFn = (_route, state: RouterStateSnapshot, authService: AuthService = inject(AuthService), router: Router = inject(Router), firstLoginFlow: FirstLoginFlowService = inject(FirstLoginFlowService)) => {
  if (state.url.startsWith('/change-password')) { return true; }
  return combineLatest([
    // Unlike getAuthenticatedUserFromStore(), this emits null for anonymous
    // visitors instead of waiting forever and blocking every public route.
    authService.getAuthenticatedUserFromStoreIfAuthenticated(),
    authService.isExternalAuthentication(),
  ]).pipe(
    take(1),
    map(([user, external]) => {
      // The password endpoint has already committed at this point. Let the
      // short-lived first-login transition finish even if this selector still
      // contains the pre-change EPerson. The backend remains authoritative.
      const completedPasswordChange = firstLoginFlow.hasCompletedPasswordChange(user?.id);
      return user?.passwordChangeRequired && !external && !completedPasswordChange
        ? router.createUrlTree(['/change-password'])
        : true;
    }),
  );
};

export const passwordChangeRequiredChildGuard: CanActivateChildFn = (route, state) => passwordChangeRequiredGuard(route, state);
