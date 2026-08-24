import { Injectable } from '@angular/core';
import { hasValue } from '@dspace/shared/utils/empty.util';
import { Operation } from 'fast-json-patch';
import {
  combineLatest,
  Observable,
  of,
} from 'rxjs';
import {
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { CookieService } from '../cookies/cookie.service';
import { EPersonDataService } from '../eperson/eperson-data.service';
import { getFirstCompletedRemoteData } from '../shared/operators';

export const END_USER_AGREEMENT_COOKIE = 'hasAgreedEndUser';
export const END_USER_AGREEMENT_METADATA_FIELD = 'dspace.agreements.end-user';

/**
 * Service for checking and managing the status of the current end user agreement
 */
@Injectable({ providedIn: 'root' })
export class EndUserAgreementService {

  constructor(protected cookie: CookieService,
              protected authService: AuthService,
              protected ePersonService: EPersonDataService) {
  }

  /**
   * Whether or not either the cookie was accepted or the current user has accepted the End User Agreement
   * @param acceptedWhenAnonymous Whether or not the user agreement should be considered accepted if the user is
   *                              currently not authenticated (anonymous)
   */
  hasCurrentUserOrCookieAcceptedAgreement(acceptedWhenAnonymous: boolean): Observable<boolean> {
    if (this.isCookieAccepted()) {
      return of(true);
    } else {
      return this.hasCurrentUserAcceptedAgreement(acceptedWhenAnonymous);
    }
  }

  /**
   * Whether or not the current user has accepted the End User Agreement
   * @param acceptedWhenAnonymous Whether or not the user agreement should be considered accepted if the user is
   *                              currently not authenticated (anonymous)
   */
  hasCurrentUserAcceptedAgreement(acceptedWhenAnonymous: boolean): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      switchMap((authenticated) => {
        if (authenticated) {
          return this.authService.getAuthenticatedUserFromStore().pipe(
            map((user) => hasValue(user) && user.hasMetadata(END_USER_AGREEMENT_METADATA_FIELD) && user.firstMetadata(END_USER_AGREEMENT_METADATA_FIELD).value === 'true'),
          );
        } else {
          return of(acceptedWhenAnonymous);
        }
      }),
    );
  }

  /**
   * Set the current user's accepted agreement status
   * When a user is authenticated, set their metadata to the provided value
   * When no user is authenticated, set the cookie to the provided value
   * @param accepted
   */
  setUserAcceptedAgreement(accepted: boolean): Observable<boolean> {
    return combineLatest([
      this.authService.isAuthenticationLoaded(),
      this.authService.isAuthenticated(),
      this.authService.getAuthenticatedUserIdFromStore(),
    ]).pipe(
      // Do not mistake the brief gap between token authentication and loading
      // its EPerson ID for an anonymous agreement. Waiting here keeps the
      // acceptance attached to the account that is actually on screen.
      filter(([loaded, authenticated, userId]) => loaded && (!authenticated || hasValue(userId))),
      take(1),
      switchMap(([_loaded, authenticated, userId]) => {
        if (authenticated && hasValue(userId)) {
          return this.getFreshUser(userId).pipe(
            switchMap((user) => {
              if (!hasValue(user)) {
                return of(false);
              }
              const newValue = { value: String(accepted) };
              const operation: Operation = user.hasMetadata(END_USER_AGREEMENT_METADATA_FIELD)
                ? { op: 'replace', path: `/metadata/${END_USER_AGREEMENT_METADATA_FIELD}/0`, value: newValue }
                : { op: 'add', path: `/metadata/${END_USER_AGREEMENT_METADATA_FIELD}`, value: [newValue] };
              return this.ePersonService.patch(user, [operation]).pipe(
                getFirstCompletedRemoteData(),
                switchMap((response) => response.hasSucceeded
                  ? this.getFreshUser(userId).pipe(map((freshUser) => hasValue(freshUser)
                    && freshUser.hasMetadata(END_USER_AGREEMENT_METADATA_FIELD)
                    && freshUser.firstMetadata(END_USER_AGREEMENT_METADATA_FIELD).value === String(accepted)))
                  : of(false)),
              );
            }),
          );
        } else if (!authenticated) {
          this.setCookieAccepted(accepted);
          return of(true);
        }
        // This is defensive: the filter above only permits this branch when
        // authentication is fully loaded but has no account.
        return of(false);
      }),
    );
  }

  private getFreshUser(userId: string) {
    return this.ePersonService.findById(userId, false, false).pipe(
      getFirstCompletedRemoteData(),
      map((response) => response.hasSucceeded ? response.payload : null),
    );
  }

  /**
   * Is the End User Agreement accepted in the cookie?
   */
  isCookieAccepted(): boolean {
    return this.cookie.get(END_USER_AGREEMENT_COOKIE) === true;
  }

  /**
   * Set the cookie's End User Agreement accepted state
   * @param accepted
   */
  setCookieAccepted(accepted: boolean) {
    this.cookie.set(END_USER_AGREEMENT_COOKIE, accepted);
  }

  /**
   * Remove the End User Agreement cookie
   */
  removeCookieAccepted() {
    this.cookie.remove(END_USER_AGREEMENT_COOKIE);
  }

}
