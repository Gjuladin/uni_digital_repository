import {
  Route,
  Routes,
} from '@angular/router';
import { i18nBreadcrumbResolver } from '@dspace/core/breadcrumbs/i18n-breadcrumb.resolver';
import { notifyInfoGuard } from '@dspace/core/coar-notify/notify-info/notify-info.guard';
import { feedbackGuard } from '@dspace/core/feedback/feedback.guard';
import {
  ACCESSIBILITY_SETTINGS_PATH,
  COAR_NOTIFY_SUPPORT,
  END_USER_AGREEMENT_PATH,
  FEEDBACK_PATH,
  PRIVACY_PATH,
  REPOSITORY_POLICIES_PATH,
} from '@dspace/core/router/info-routing-paths';
import { hasValue } from '@dspace/shared/utils/empty.util';

import { environment } from '../../environments/environment';
import { AccessibilitySettingsComponent } from './accessibility-settings/accessibility-settings.component';
import { ThemedEndUserAgreementComponent } from './end-user-agreement/themed-end-user-agreement.component';
import { ThemedFeedbackComponent } from './feedback/themed-feedback.component';
import { NotifyInfoComponent } from './notify-info/notify-info.component';
import { ThemedPrivacyComponent } from './privacy/themed-privacy.component';
import { RepositoryPoliciesComponent } from './repository-policies/repository-policies.component';
import { repositoryPoliciesGuard } from './repository-policies/repository-policies.guard';
import { RepositoryPolicyPageComponent } from './repository-policies/repository-policy-page.component';
import { repositoryPolicyPublicationGuard } from './repository-policies/repository-policy-publication.guard';


export const ROUTES: Routes = [
  ...[
    { path: REPOSITORY_POLICIES_PATH, title: 'info.repository-policies.title', breadcrumbKey: 'info.repository-policies' },
    { path: 'accessibility-statement', title: 'footer.link.accessibility-statement', breadcrumbKey: 'info.accessibility-statement' },
    { path: PRIVACY_PATH, title: 'footer.link.privacy-notice', breadcrumbKey: 'info.repository-privacy' },
    { path: 'contact', title: 'footer.link.contact', breadcrumbKey: 'info.repository-contact' },
  ].map(({ path, title, breadcrumbKey }) => ({
    path,
    component: RepositoryPolicyPageComponent,
    canMatch: [repositoryPolicyPublicationGuard],
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { policyId: path, title, breadcrumbKey },
  })),
  ...[
    { path: 'metadata-curation', fragment: 'metadata-reuse-and-curation' },
    { path: 'preservation', fragment: 'retention-and-service-continuity' },
  ].map(({ path, fragment }) => ({
    path,
    pathMatch: 'full' as const,
    canMatch: [repositoryPolicyPublicationGuard],
    redirectTo: `${REPOSITORY_POLICIES_PATH}#${fragment}`,
  })),
  {
    path: REPOSITORY_POLICIES_PATH,
    component: RepositoryPoliciesComponent,
    canActivate: [repositoryPoliciesGuard],
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.repository-policies.title', breadcrumbKey: 'info.repository-policies' },
  },
  {
    path: FEEDBACK_PATH,
    component: ThemedFeedbackComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.feedback.title', breadcrumbKey: 'info.feedback' },
    canActivate: [feedbackGuard],
  },
  {
    path: ACCESSIBILITY_SETTINGS_PATH,
    component: AccessibilitySettingsComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.accessibility-settings.title', breadcrumbKey: 'info.accessibility-settings' },
  },
  environment.info.enableEndUserAgreement ? {
    path: END_USER_AGREEMENT_PATH,
    component: ThemedEndUserAgreementComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.end-user-agreement.title', breadcrumbKey: 'info.end-user-agreement' },
  } : undefined,
  environment.info.enablePrivacyStatement ? {
    path: PRIVACY_PATH,
    component: ThemedPrivacyComponent,
    resolve: { breadcrumb: i18nBreadcrumbResolver },
    data: { title: 'info.privacy.title', breadcrumbKey: 'info.privacy' },
  } : undefined,
  environment.info.enableCOARNotifySupport ? {
    path: COAR_NOTIFY_SUPPORT,
    component: NotifyInfoComponent,
    canActivate: [notifyInfoGuard],
    resolve: {
      breadcrumb: i18nBreadcrumbResolver,
    },
    data: {
      title: 'info.coar-notify-support.title',
      breadcrumbKey: 'info.coar-notify-support',
    },
  } : undefined,
].filter((route: Route) => hasValue(route));
