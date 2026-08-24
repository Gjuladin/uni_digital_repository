import {
  Component,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { LogOutAction } from '@dspace/core/auth/auth.actions';
import { AuthService } from '@dspace/core/auth/auth.service';
import { AuthorizationDataService } from '@dspace/core/data/feature-authorization/authorization-data.service';
import { EndUserAgreementService } from '@dspace/core/end-user-agreement/end-user-agreement.service';
import { NotificationsService } from '@dspace/core/notification-system/notifications.service';
import { isNotEmpty } from '@dspace/shared/utils/empty.util';
import { Store } from '@ngrx/store';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { of } from 'rxjs';
import {
  catchError,
  take,
} from 'rxjs/operators';

import { AppState } from '../../app.reducer';
import { FirstLoginFlowService } from '../../core/auth/first-login-flow.service';
import { BtnDisabledDirective } from '../../shared/btn-disabled.directive';
import { MenuProviderService } from '../../shared/menu/menu-provider.service';
import { EndUserAgreementContentComponent } from './end-user-agreement-content/end-user-agreement-content.component';

@Component({
  selector: 'ds-base-end-user-agreement',
  templateUrl: './end-user-agreement.component.html',
  styleUrls: ['./end-user-agreement.component.scss'],
  imports: [
    BtnDisabledDirective,
    EndUserAgreementContentComponent,
    FormsModule,
    TranslateModule,
  ],
})
/**
 * Component displaying the End User Agreement and an option to accept it
 */
export class EndUserAgreementComponent implements OnInit {

  /**
   * Whether or not the user agreement has been accepted
   */
  accepted = false;
  submitting = false;

  constructor(protected endUserAgreementService: EndUserAgreementService,
              protected notificationsService: NotificationsService,
              protected translate: TranslateService,
              protected authService: AuthService,
              protected store: Store<AppState>,
              protected router: Router,
              protected route: ActivatedRoute,
              protected firstLoginFlow: FirstLoginFlowService,
              protected authorizationService: AuthorizationDataService,
              protected menuProviderService: MenuProviderService) {
  }

  /**
   * Initialize the component
   */
  ngOnInit(): void {
    this.initAccepted();
  }

  /**
   * Initialize the "accepted" property of this component by checking if the current user has accepted it before
   */
  initAccepted() {
    this.endUserAgreementService.hasCurrentUserOrCookieAcceptedAgreement(false).pipe(take(1)).subscribe((accepted) => {
      this.accepted = accepted;
    });
  }

  /**
   * Submit the form
   * Set the End User Agreement, display a notification and (optionally) redirect the user back to their original destination
   */
  submit() {
    if (this.submitting || !this.accepted) {
      return;
    }
    this.submitting = true;
    this.endUserAgreementService.setUserAcceptedAgreement(this.accepted).pipe(
      take(1),
      catchError(() => of(false)),
    ).subscribe((success) => {
      if (!success) {
        this.notificationsService.error(this.translate.instant('info.end-user-agreement.accept.error'));
        this.submitting = false;
        return;
      }

      this.notificationsService.success(this.translate.instant('info.end-user-agreement.accept.success'));
      // Persistent admin menu sections are evaluated once during application
      // startup. Re-evaluate them after first-login setup so a newly granted
      // administrator sees the authenticated sidebar without refreshing.
      this.authorizationService.invalidateAuthorizationsRequestCache();
      this.menuProviderService.refreshPersistentMenus(false).pipe(
        take(1),
        catchError(() => of(false)),
      ).subscribe(() => {
        this.route.queryParams.pipe(take(1)).subscribe((params) => this.navigateAfterAcceptance(params.redirect));
      });
    });
  }

  private navigateAfterAcceptance(redirectUrl?: string): void {
    this.firstLoginFlow.clear();
    if (!isNotEmpty(redirectUrl)) {
      this.submitting = false;
      return;
    }

    let decodedUrl = '/home';
    try {
      const candidate = decodeURIComponent(redirectUrl);
      if (candidate.startsWith('/') && !candidate.startsWith('//')) {
        decodedUrl = candidate;
      }
    } catch {
      // Invalid redirect encoding falls back to the repository home page.
    }
    void this.router.navigateByUrl(decodedUrl, { replaceUrl: true }).finally(() => this.submitting = false);
  }

  /**
   * Cancel the agreement
   * If the user is logged in, this will log them out
   * If the user is not logged in, they will be redirected to the homepage
   */
  cancel() {
    this.firstLoginFlow.clear();
    this.authService.isAuthenticated().pipe(take(1)).subscribe((authenticated) => {
      if (authenticated) {
        this.store.dispatch(new LogOutAction());
      } else {
        this.router.navigate(['home']);
      }
    });
  }

}
