import { Injectable } from '@angular/core';

/**
 * Holds the short-lived client-side transition between a successful forced
 * password change and agreement acceptance.
 *
 * The backend response is authoritative. This marker only prevents a stale
 * EPerson cache entry or a late PASSWORD_CHANGE_REQUIRED response from
 * navigating the same browser session back to the password form.
 */
@Injectable({ providedIn: 'root' })
export class FirstLoginFlowService {
  private passwordChangedForUserId: string | undefined;

  markPasswordChanged(userId: string): void {
    this.passwordChangedForUserId = userId;
  }

  hasCompletedPasswordChange(userId?: string): boolean {
    return !!this.passwordChangedForUserId && (!userId || this.passwordChangedForUserId === userId);
  }

  clear(): void {
    this.passwordChangedForUserId = undefined;
  }
}
