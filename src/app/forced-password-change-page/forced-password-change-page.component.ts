import {
  Component,
  Inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  APP_CONFIG,
  AppConfig,
} from '@dspace/config/app-config.interface';
import { AuthService } from '@dspace/core/auth/auth.service';
import { RequestService } from '@dspace/core/data/request.service';
import { EPersonDataService } from '@dspace/core/eperson/eperson-data.service';
import { EPerson } from '@dspace/core/eperson/models/eperson.model';
import { getEndUserAgreementPath } from '@dspace/core/router/info-routing-paths';
import { getFirstSucceededRemoteDataPayload } from '@dspace/core/shared/operators';
import { hasValue } from '@dspace/shared/utils/empty.util';
import { TranslateModule } from '@ngx-translate/core';
import {
  defer,
  map,
  retry,
  tap,
  throwError,
  timer,
} from 'rxjs';
import {
  switchMap,
  take,
} from 'rxjs/operators';

import { AccountManagementService } from '../access-control/epeople-registry/account-management.service';
import { FirstLoginFlowService } from '../core/auth/first-login-flow.service';
import { BtnDisabledDirective } from '../shared/btn-disabled.directive';

@Component({
  selector: 'ds-forced-password-change-page',
  templateUrl: './forced-password-change-page.component.html',
  imports: [
    BtnDisabledDirective,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class ForcedPasswordChangePageComponent {
  error: string;
  saving = false;
  passwordChanged = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmation = false;
  form = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', Validators.required],
    confirmation: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private accounts: AccountManagementService,
    private authService: AuthService,
    private ePersonService: EPersonDataService,
    private requestService: RequestService,
    private router: Router,
    private firstLoginFlow: FirstLoginFlowService,
    @Inject(APP_CONFIG) private appConfig: AppConfig,
  ) {}

  submit(): void {
    if (this.saving) {
      return;
    }
    if (this.passwordChanged) {
      this.continueAfterPasswordChange();
      return;
    }
    if (this.form.invalid || this.form.value.newPassword !== this.form.value.confirmation) {
      this.error = 'password-change.error.validation';
      return;
    }

    const values = this.form.getRawValue();
    this.setSaving(true);
    this.authService.getAuthenticatedUserIdFromStore().pipe(
      take(1),
      switchMap((id) => hasValue(id)
        ? this.accounts.changeMyPassword(values.currentPassword, values.newPassword).pipe(
          tap(() => {
            this.passwordChanged = true;
            this.firstLoginFlow.markPasswordChanged(id);
          }),
          switchMap(() => this.refreshCurrentUser(id)),
        )
        : throwError(() => new Error('No authenticated user is available to change'))),
    ).subscribe({
      next: (user) => this.navigateAfterPasswordChange(user),
      error: () => {
        this.error = this.passwordChanged ? 'password-change.error.refresh' : 'password-change.error.save';
        this.setSaving(false);
      },
    });
  }

  togglePasswordVisibility(field: 'currentPassword' | 'newPassword' | 'confirmation'): void {
    switch (field) {
      case 'currentPassword':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'newPassword':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirmation':
        this.showConfirmation = !this.showConfirmation;
        break;
    }
  }

  private continueAfterPasswordChange(): void {
    this.setSaving(true);
    this.authService.getAuthenticatedUserIdFromStore().pipe(
      take(1),
      switchMap((id) => hasValue(id)
        ? this.refreshCurrentUser(id)
        : throwError(() => new Error('No authenticated user is available to refresh'))),
    ).subscribe({
      next: (user) => this.navigateAfterPasswordChange(user),
      error: () => {
        this.error = 'password-change.error.refresh';
        this.setSaving(false);
      },
    });
  }

  private refreshCurrentUser(id: string) {
    return defer(() => this.ePersonService.findById(id, false, false).pipe(
      getFirstSucceededRemoteDataPayload<EPerson>(),
      map((user) => {
        // The database commit can briefly precede eviction of DSpace's
        // EPerson cache. Treat that old representation as transient and fetch
        // it again instead of asking the user to click the form repeatedly.
        if (user.passwordChangeRequired) {
          throw new Error('The refreshed EPerson still contains the pre-change password flag');
        }
        return user;
      }),
    )).pipe(
      retry({ count: 6, delay: (_error, retryCount) => timer(Math.min(retryCount * 250, 1000)) }),
    );
  }

  private navigateAfterPasswordChange(user: EPerson): void {
    if (user.passwordChangeRequired) {
      this.error = 'password-change.error.still-required';
      this.setSaving(false);
      return;
    }

    // Application startup may have cached 403 responses while the forced
    // password gate was active. Invalidate all of them now that the gate has
    // been lifted, otherwise authorization-backed menus remain anonymous
    // until the browser is manually refreshed.
    this.requestService.setAllStale().pipe(take(1)).subscribe();

    const agreementAccepted = user.hasMetadata('dspace.agreements.end-user')
      && user.firstMetadata('dspace.agreements.end-user').value === 'true';

    if (this.appConfig.info.enableEndUserAgreement && !agreementAccepted) {
      void this.router.navigate([getEndUserAgreementPath()], {
        queryParams: { redirect: encodeURIComponent('/home') },
        replaceUrl: true,
      });
    } else {
      void this.router.navigate(['/home'], { replaceUrl: true }).finally(() => this.firstLoginFlow.clear());
    }
  }

  private setSaving(saving: boolean): void {
    this.saving = saving;
    if (saving) {
      this.error = undefined;
      this.form.disable({ emitEvent: false });
    } else if (!this.passwordChanged) {
      this.form.enable({ emitEvent: false });
    }
  }
}
