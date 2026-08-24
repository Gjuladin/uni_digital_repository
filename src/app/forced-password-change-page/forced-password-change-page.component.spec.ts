import {
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AppConfig } from '@dspace/config/app-config.interface';
import { AuthService } from '@dspace/core/auth/auth.service';
import { RequestService } from '@dspace/core/data/request.service';
import { EPersonDataService } from '@dspace/core/eperson/eperson-data.service';
import { EPerson } from '@dspace/core/eperson/models/eperson.model';
import { createSuccessfulRemoteDataObject$ } from '@dspace/core/utilities/remote-data.utils';
import { of } from 'rxjs';

import { AccountManagementService } from '../access-control/epeople-registry/account-management.service';
import { FirstLoginFlowService } from '../core/auth/first-login-flow.service';
import { ForcedPasswordChangePageComponent } from './forced-password-change-page.component';

describe('ForcedPasswordChangePageComponent', () => {
  let component: ForcedPasswordChangePageComponent;
  let accounts: jasmine.SpyObj<AccountManagementService>;
  let authService: jasmine.SpyObj<AuthService>;
  let ePersonService: jasmine.SpyObj<EPersonDataService>;
  let requestService: jasmine.SpyObj<RequestService>;
  let router: jasmine.SpyObj<Router>;
  let firstLoginFlow: jasmine.SpyObj<FirstLoginFlowService>;

  const user = (agreementAccepted: boolean, passwordChangeRequired = false): EPerson => Object.assign(new EPerson(), {
    id: 'user-id',
    passwordChangeRequired,
    metadata: agreementAccepted ? {
      'dspace.agreements.end-user': [{ value: 'true' }],
    } : {},
  });

  const createComponent = (enableEndUserAgreement: boolean, agreementAccepted = false, passwordChangeRequired = false) => {
    accounts = jasmine.createSpyObj('accounts', ['changeMyPassword']);
    authService = jasmine.createSpyObj('authService', ['getAuthenticatedUserIdFromStore']);
    ePersonService = jasmine.createSpyObj('ePersonService', ['findById']);
    requestService = jasmine.createSpyObj('requestService', ['setAllStale']);
    router = jasmine.createSpyObj('router', ['navigate']);
    firstLoginFlow = jasmine.createSpyObj('firstLoginFlow', ['markPasswordChanged', 'clear']);

    accounts.changeMyPassword.and.returnValue(of(undefined));
    authService.getAuthenticatedUserIdFromStore.and.returnValue(of('user-id'));
    ePersonService.findById.and.returnValue(createSuccessfulRemoteDataObject$(user(agreementAccepted, passwordChangeRequired)));
    requestService.setAllStale.and.returnValue(of(true));
    router.navigate.and.resolveTo(true);

    component = new ForcedPasswordChangePageComponent(
      new FormBuilder(),
      accounts,
      authService,
      ePersonService,
      requestService,
      router,
      firstLoginFlow,
      { info: { enableEndUserAgreement } } as AppConfig,
    );
  };

  it('refreshes the uncached EPerson and routes an unaccepted user to the full agreement', () => {
    createComponent(true);
    component.form.setValue({ currentPassword: 'temporary', newPassword: 'new-password', confirmation: 'new-password' });

    component.submit();

    expect(ePersonService.findById).toHaveBeenCalledWith('user-id', false, false);
    expect(router.navigate).toHaveBeenCalledWith(['/info/end-user-agreement'], {
      queryParams: { redirect: encodeURIComponent('/home') },
      replaceUrl: true,
    });
    expect(firstLoginFlow.markPasswordChanged).toHaveBeenCalledWith('user-id');
    expect(requestService.setAllStale).toHaveBeenCalled();
  });

  it('returns an accepted user directly to the home route', () => {
    createComponent(true, true);
    component.form.setValue({ currentPassword: 'temporary', newPassword: 'new-password', confirmation: 'new-password' });

    component.submit();

    expect(router.navigate).toHaveBeenCalledWith(['/home'], { replaceUrl: true });
  });

  it('automatically waits through a stale post-change EPerson response', fakeAsync(() => {
    createComponent(true);
    ePersonService.findById.and.returnValues(
      createSuccessfulRemoteDataObject$(user(false, true)),
      createSuccessfulRemoteDataObject$(user(false, true)),
      createSuccessfulRemoteDataObject$(user(false, false)),
    );
    component.form.setValue({ currentPassword: 'temporary', newPassword: 'new-password', confirmation: 'new-password' });

    component.submit();
    expect(router.navigate).not.toHaveBeenCalled();
    tick(750);

    expect(ePersonService.findById).toHaveBeenCalledTimes(3);
    expect(router.navigate).toHaveBeenCalledWith(['/info/end-user-agreement'], {
      queryParams: { redirect: encodeURIComponent('/home') },
      replaceUrl: true,
    });
  }));

  it('keeps the safe Continue state if the account refresh remains stale', fakeAsync(() => {
    createComponent(false, false, true);
    component.form.setValue({ currentPassword: 'temporary', newPassword: 'new-password', confirmation: 'new-password' });

    component.submit();
    tick(4500);

    expect(component.error).toBe('password-change.error.refresh');
    expect(component.saving).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('toggles password visibility independently for each field', () => {
    createComponent(false);

    component.togglePasswordVisibility('currentPassword');
    component.togglePasswordVisibility('confirmation');

    expect(component.showCurrentPassword).toBeTrue();
    expect(component.showNewPassword).toBeFalse();
    expect(component.showConfirmation).toBeTrue();
  });

  it('submits the password mutation only once while the transition is active', () => {
    createComponent(true);
    component.form.setValue({ currentPassword: 'temporary', newPassword: 'new-password', confirmation: 'new-password' });

    component.submit();
    component.submit();

    expect(accounts.changeMyPassword).toHaveBeenCalledTimes(1);
  });
});
