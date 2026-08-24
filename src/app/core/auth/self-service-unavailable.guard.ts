import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LOGIN_ROUTE } from '@dspace/core/auth/auth.service';
import { NotificationsService } from '@dspace/core/notification-system/notifications.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Registration and email recovery are deliberately unavailable while the
 * repository uses administrator-provisioned accounts.
 */
export const selfServiceUnavailableGuard: CanActivateFn = () => {
  const notifications = inject(NotificationsService);
  const translate = inject(TranslateService);
  const router = inject(Router);

  notifications.info(
    translate.instant('login.self-service-unavailable.title'),
    translate.instant('login.self-service-unavailable.content'),
  );
  return router.parseUrl(LOGIN_ROUTE);
};
