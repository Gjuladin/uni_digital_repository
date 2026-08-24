import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { LogOutAction } from '@dspace/core/auth/auth.actions';
import { AuthService } from '@dspace/core/auth/auth.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { EndUserAgreementService } from '@dspace/core/end-user-agreement/end-user-agreement.service';
import { NotificationsService } from '@dspace/core/notification-system/notifications.service';
import { ActivatedRouteStub } from '@dspace/core/testing/active-router.stub';
import { Store } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import {
  of,
  Subject,
} from 'rxjs';

import { FirstLoginFlowService } from '../../core/auth/first-login-flow.service';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';
import { MenuProviderService } from '../../shared/menu/menu-provider.service';
import { EndUserAgreementComponent } from './end-user-agreement.component';
import { EndUserAgreementContentComponent } from './end-user-agreement-content/end-user-agreement-content.component';

describe('EndUserAgreementComponent', () => {
  let component: EndUserAgreementComponent;
  let fixture: ComponentFixture<EndUserAgreementComponent>;

  let endUserAgreementService: EndUserAgreementService;
  let notificationsService: NotificationsService;
  let authService: AuthService;
  let store;
  let router: Router;
  let route: ActivatedRoute;
  let firstLoginFlow: jasmine.SpyObj<FirstLoginFlowService>;
  let authorizationService: jasmine.SpyObj<AuthorizationDataService>;
  let menuProviderService: jasmine.SpyObj<MenuProviderService>;

  let redirectUrl;

  function init() {
    redirectUrl = encodeURIComponent('/redirect/url');

    endUserAgreementService = jasmine.createSpyObj('endUserAgreementService', {
      hasCurrentUserOrCookieAcceptedAgreement: of(false),
      setUserAcceptedAgreement: of(true),
    });
    notificationsService = jasmine.createSpyObj('notificationsService', ['success', 'error']);
    authService = jasmine.createSpyObj('authService', {
      isAuthenticated: of(true),
    });
    store = jasmine.createSpyObj('store', ['dispatch']);
    router = jasmine.createSpyObj('router', ['navigate', 'navigateByUrl']);
    (router.navigateByUrl as jasmine.Spy).and.resolveTo(true);
    route = Object.assign(new ActivatedRouteStub(), {
      queryParams: of({
        redirect: redirectUrl,
      }),
    }) as any;
    firstLoginFlow = jasmine.createSpyObj('firstLoginFlow', ['clear']);
    authorizationService = jasmine.createSpyObj('authorizationService', ['invalidateAuthorizationsRequestCache']);
    menuProviderService = jasmine.createSpyObj('menuProviderService', {
      refreshPersistentMenus: of(true),
    });

    endUserAgreementService = jasmine.createSpyObj('endUserAgreementService', {
      hasCurrentUserOrCookieAcceptedAgreement: of(false),
      setUserAcceptedAgreement: of(true),
    });
  }

  beforeEach(waitForAsync(() => {
    init();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), EndUserAgreementComponent, BtnDisabledDirective],
      providers: [
        { provide: EndUserAgreementService, useValue: endUserAgreementService },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: AuthService, useValue: authService },
        { provide: Store, useValue: store },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
        { provide: FirstLoginFlowService, useValue: firstLoginFlow },
        { provide: AuthorizationDataService, useValue: authorizationService },
        { provide: MenuProviderService, useValue: menuProviderService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(EndUserAgreementComponent, {
        remove: {
          imports: [EndUserAgreementContentComponent],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndUserAgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('when the user hasn\'t accepted the agreement', () => {
    beforeEach(() => {
      (endUserAgreementService.hasCurrentUserOrCookieAcceptedAgreement as jasmine.Spy).and.returnValue(of(false));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should initialize the accepted property', () => {
      expect(component.accepted).toEqual(false);
    });

    it('should disable the save button', () => {
      const button = fixture.debugElement.query(By.css('#button-save')).nativeElement;
      expect(button.getAttribute('aria-disabled')).toBe('true');
      expect(button.classList.contains('disabled')).toBeTrue();
    });
  });

  describe('when the user has accepted the agreement', () => {
    beforeEach(() => {
      (endUserAgreementService.hasCurrentUserOrCookieAcceptedAgreement as jasmine.Spy).and.returnValue(of(true));
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should initialize the accepted property', () => {
      expect(component.accepted).toEqual(true);
    });

    it('should enable the save button', () => {
      const button = fixture.debugElement.query(By.css('#button-save')).nativeElement;
      expect(button.disabled).toBeFalsy();
    });

    describe('submit', () => {
      describe('when accepting the agreement was successful', () => {
        beforeEach(() => {
          (endUserAgreementService.setUserAcceptedAgreement as jasmine.Spy).and.returnValue(of(true));
          component.submit();
        });

        it('should display a success notification', () => {
          expect(notificationsService.success).toHaveBeenCalled();
        });

        it('should navigate the user to the redirect url', fakeAsync(() => {
          tick();
          expect(router.navigateByUrl).toHaveBeenCalledWith('/redirect/url', { replaceUrl: true });
          expect(firstLoginFlow.clear).toHaveBeenCalled();
        }));

        it('should refresh authorization-backed menus', () => {
          expect(authorizationService.invalidateAuthorizationsRequestCache).toHaveBeenCalled();
          expect(menuProviderService.refreshPersistentMenus).toHaveBeenCalledWith(false);
        });
      });

      it('should wait for the refreshed menus before navigating', fakeAsync(() => {
        const menuRefresh$ = new Subject<boolean>();
        menuProviderService.refreshPersistentMenus.and.returnValue(menuRefresh$);
        (endUserAgreementService.setUserAcceptedAgreement as jasmine.Spy).and.returnValue(of(true));

        component.submit();

        expect(router.navigateByUrl).not.toHaveBeenCalled();
        menuRefresh$.next(true);
        menuRefresh$.complete();
        tick();
        expect(router.navigateByUrl).toHaveBeenCalledWith('/redirect/url', { replaceUrl: true });
      }));

      describe('when accepting the agreement was unsuccessful', () => {
        beforeEach(() => {
          (endUserAgreementService.setUserAcceptedAgreement as jasmine.Spy).and.returnValue(of(false));
          component.submit();
        });

        it('should display an error notification', () => {
          expect(notificationsService.error).toHaveBeenCalled();
        });

        it('should allow the user to retry', () => {
          expect(component.submitting).toBeFalse();
        });
      });

      it('submits the agreement only once while acceptance is in progress', () => {
        const acceptance$ = new Subject<boolean>();
        (endUserAgreementService.setUserAcceptedAgreement as jasmine.Spy).and.returnValue(acceptance$);

        component.submit();
        component.submit();

        expect(endUserAgreementService.setUserAcceptedAgreement).toHaveBeenCalledTimes(1);
        acceptance$.next(true);
        acceptance$.complete();
      });
    });
  });

  describe('cancel', () => {
    describe('when the user is authenticated', () => {
      beforeEach(() => {
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(of(true));
        component.cancel();
      });

      it('should logout the user', () => {
        expect(store.dispatch).toHaveBeenCalledWith(new LogOutAction());
      });
    });

    describe('when the user is not authenticated', () => {
      beforeEach(() => {
        (authService.isAuthenticated as jasmine.Spy).and.returnValue(of(false));
        component.cancel();
      });

      it('should navigate the user to the homepage', () => {
        expect(router.navigate).toHaveBeenCalledWith(['home']);
      });
    });
  });
});
