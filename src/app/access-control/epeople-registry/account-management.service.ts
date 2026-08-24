import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@dspace/config/app-config.interface';
import { Observable } from 'rxjs';

export interface ManagedRole {
  id: string;
  label: string;
  category: string;
  roleType?: string;
  scope?: { type: string; id: string; name: string };
}

export interface PermissionScope {
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  resourcePath?: string;
  parentResourceType?: string;
  parentResourceId?: string;
  parentResourceName?: string;
  parentResourcePath?: string;
}

export interface PermissionAssignment extends PermissionScope {
  fullControl: boolean;
  actions: string[];
}

export interface PermissionScopePage {
  scopes: PermissionScope[];
  totalElements: number;
  page?: number;
  size?: number;
}

export interface AccountValidationError { index?: number; field: string; message: string; }

export interface ManagedUser {
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  email?: string;
  canLogIn: boolean;
  passwordChangeRequired: boolean;
  roleIds?: string[];
  inheritedRoles?: ManagedRole[];
  unmanagedRoles?: ManagedRole[];
  repositoryAdministrator?: boolean;
  contentManager?: boolean;
  permissionAssignments?: PermissionAssignment[];
  inheritedPermissionAssignments?: PermissionAssignment[];
  unmanagedPermissionAssignments?: PermissionAssignment[];
}

export interface ManagedUserPage { users: ManagedUser[]; totalElements: number; page?: number; size?: number; }

@Injectable({ providedIn: 'root' })
export class AccountManagementService {
  private readonly baseUrl: string;
  constructor(private http: HttpClient, @Inject(APP_CONFIG) config: AppConfig) { this.baseUrl = `${config.rest.baseUrl}/api/eperson/account-management`; }

  users(query = '', page = 0, size = 25): Observable<ManagedUserPage> {
    return this.http.get<ManagedUserPage>(`${this.baseUrl}/users`, { params: new HttpParams().set('query', query).set('page', page).set('size', size) });
  }
  user(id: string): Observable<ManagedUser> { return this.http.get<ManagedUser>(`${this.baseUrl}/users/${id}`); }
  roles(): Observable<ManagedRole[]> { return this.http.get<ManagedRole[]>(`${this.baseUrl}/roles`); }
  permissionScopes(query = '', resourceType?: string, page = 0, size = 10): Observable<PermissionScopePage | PermissionScope[]> {
    let params = new HttpParams().set('query', query).set('page', page).set('size', size);
    if (resourceType) { params = params.set('resourceType', resourceType); }
    return this.http.get<PermissionScopePage | PermissionScope[]>(`${this.baseUrl}/permission-scopes`, { params });
  }
  create(body: any): Observable<ManagedUser[]> { return this.http.post<ManagedUser[]>(`${this.baseUrl}/users`, body); }
  update(id: string, body: any): Observable<ManagedUser> { return this.http.put<ManagedUser>(`${this.baseUrl}/users/${id}`, body); }
  delete(id: string): Observable<void> { return this.http.delete<void>(`${this.baseUrl}/users/${id}`); }
  resetPassword(id: string, password: string, requirePasswordChange = true): Observable<void> { return this.http.post<void>(`${this.baseUrl}/users/${id}/password`, { password, requirePasswordChange }); }
  changeMyPassword(currentPassword: string, newPassword: string): Observable<void> { return this.http.post<void>(`${this.baseUrl}/me/password`, { currentPassword, newPassword }); }
}
