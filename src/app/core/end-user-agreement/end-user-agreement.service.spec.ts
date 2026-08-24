import {
  BehaviorSubject,
  of,
} from 'rxjs';

import { EPerson } from '../eperson/models/eperson.model';
import { CookieServiceMock } from '../testing/cookie.service.mock';
import { createSuccessfulRemoteDataObject$ } from '../utilities/remote-data.utils';
import {
  END_USER_AGREEMENT_COOKIE,
  END_USER_AGREEMENT_METADATA_FIELD,
  EndUserAgreementService,
} from './end-user-agreement.service';

describe('EndUserAgreementService', () => {
  let service: EndUserAgreementService;

  let userWithMetadata: EPerson;
  let userWithoutMetadata: EPerson;

  let cookie;
  let authService;
  let ePersonService;

  beforeEach(() => {
    userWithMetadata = Object.assign(new EPerson(), {
      metadata: {
        [END_USER_AGREEMENT_METADATA_FIELD]: [
          {
            value: 'true',
          },
        ],
      },
    });
    userWithoutMetadata = Object.assign(new EPerson());

    cookie = new CookieServiceMock();
    authService = jasmine.createSpyObj('authService', {
      isAuthenticationLoaded: of(true),
      isAuthenticated: of(true),
      getAuthenticatedUserFromStore: of(userWithMetadata),
      getAuthenticatedUserIdFromStore: of('user-id'),
    });
    ePersonService = jasmine.createSpyObj('ePersonService', {
      update: createSuccessfulRemoteDataObject$(userWithMetadata),
      patch: createSuccessfulRemoteDataObject$({}),
      findById: createSuccessfulRemoteDataObject$(userWithMetadata),
    });

    service = new EndUserAgreementService(cookie, authService, ePersonService);
  });

  describe('when the cookie is set to true', () => {
    beforeEach(() => {
      cookie.set(END_USER_AGREEMENT_COOKIE, true);
    });

    it('hasCurrentUserOrCookieAcceptedAgreement should return true', (done) => {
      service.hasCurrentUserOrCookieAcceptedAgreement(false).subscribe((result) => {
        expect(result).toEqual(true);
        done();
      });
    });

    it('isCookieAccepted should return true', () => {
      expect(service.isCookieAccepted()).toEqual(true);
    });

    it('removeCookieAccepted should remove the cookie', () => {
      service.removeCookieAccepted();
      expect(cookie.get(END_USER_AGREEMENT_COOKIE)).toBeUndefined();
    });
  });

  describe('when the cookie isn\'t set', () => {
    describe('and the user is authenticated', () => {
      beforeEach(() => {
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(of(true));
      });

      describe('and the user contains agreement metadata', () => {
        beforeEach(() => {
          (authService.getAuthenticatedUserFromStore as jasmine.Spy).and.returnValue(of(userWithMetadata));
        });

        it('hasCurrentUserOrCookieAcceptedAgreement should return true', (done) => {
          service.hasCurrentUserOrCookieAcceptedAgreement(false).subscribe((result) => {
            expect(result).toEqual(true);
            done();
          });
        });
      });

      describe('and the user doesn\'t contain agreement metadata', () => {
        beforeEach(() => {
          (authService.getAuthenticatedUserFromStore as jasmine.Spy).and.returnValue(of(userWithoutMetadata));
        });

        it('hasCurrentUserOrCookieAcceptedAgreement should return false', (done) => {
          service.hasCurrentUserOrCookieAcceptedAgreement(false).subscribe((result) => {
            expect(result).toEqual(false);
            done();
          });
        });
      });

      it('setUserAcceptedAgreement should update the user with new metadata', (done) => {
        (ePersonService.findById as jasmine.Spy).and.returnValues(
          createSuccessfulRemoteDataObject$(userWithoutMetadata),
          createSuccessfulRemoteDataObject$(userWithMetadata),
        );
        service.setUserAcceptedAgreement(true).subscribe(() => {
          expect(ePersonService.patch).toHaveBeenCalled();
          expect(ePersonService.findById).toHaveBeenCalledWith('user-id', false, false);
          done();
        });
      });
    });

    describe('and the user is not authenticated', () => {
      beforeEach(() => {
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(of(false));
        (authService.getAuthenticatedUserIdFromStore as jasmine.Spy).and.returnValue(of(undefined));
      });

      it('hasCurrentUserOrCookieAcceptedAgreement should return false', (done) => {
        service.hasCurrentUserOrCookieAcceptedAgreement(false).subscribe((result) => {
          expect(result).toEqual(false);
          done();
        });
      });

      it('setUserAcceptedAgreement should set the cookie to true', (done) => {
        service.setUserAcceptedAgreement(true).subscribe(() => {
          expect(cookie.get(END_USER_AGREEMENT_COOKIE)).toEqual(true);
          done();
        });
      });

      it('does not patch a stale EPerson ID after authentication becomes anonymous', (done) => {
        (authService.getAuthenticatedUserIdFromStore as jasmine.Spy).and.returnValue(of('stale-user-id'));

        service.setUserAcceptedAgreement(true).subscribe(() => {
          expect(cookie.get(END_USER_AGREEMENT_COOKIE)).toEqual(true);
          expect(ePersonService.findById).not.toHaveBeenCalled();
          expect(ePersonService.patch).not.toHaveBeenCalled();
          done();
        });
      });
    });

    it('waits for the authenticated EPerson ID instead of accepting as anonymous', (done) => {
      const userId$ = new BehaviorSubject<string>(undefined);
      (authService.isAuthenticated as jasmine.Spy).and.returnValue(of(true));
      (authService.getAuthenticatedUserIdFromStore as jasmine.Spy).and.returnValue(userId$);
      (ePersonService.findById as jasmine.Spy).and.returnValues(
        createSuccessfulRemoteDataObject$(userWithoutMetadata),
        createSuccessfulRemoteDataObject$(userWithMetadata),
      );

      service.setUserAcceptedAgreement(true).subscribe((success) => {
        expect(success).toBeTrue();
        expect(cookie.get(END_USER_AGREEMENT_COOKIE)).toBeUndefined();
        expect(ePersonService.patch).toHaveBeenCalled();
        done();
      });
      expect(ePersonService.patch).not.toHaveBeenCalled();
      userId$.next('user-id');
    });

    it('isCookieAccepted should return false', () => {
      expect(service.isCookieAccepted()).toEqual(false);
    });

    it('setCookieAccepted should set the cookie', () => {
      service.setCookieAccepted(true);
      expect(cookie.get(END_USER_AGREEMENT_COOKIE)).toEqual(true);
    });
  });
});
