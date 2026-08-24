import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import {
  AccountManagementService,
  AccountValidationError,
  ManagedRole,
  ManagedUser,
  PermissionAssignment,
  PermissionScope,
  PermissionScopePage,
} from '../account-management.service';

const usernamePattern = /^[a-zA-Z0-9._-]{3,64}$/;
/** Approved API action names, rendered directly in the permission matrix. */
const PERMISSION_ACTIONS = ['READ', 'ADD', 'WRITE', 'DELETE'];

interface PermissionScopeTreeRow {
  scope: PermissionScope;
  assignment?: PermissionAssignment;
  depth: number;
  hasChildren: boolean;
  synthetic: boolean;
}

@Component({
  selector: 'ds-eperson-form',
  templateUrl: './eperson-form.component.html',
  styleUrls: ['./eperson-form.component.scss'],
  imports: [FormsModule, NgClass, ReactiveFormsModule, RouterLink, TranslateModule],
})
export class EPersonFormComponent implements OnInit {
  @ViewChild('resetPasswordModal') resetPasswordModal: TemplateRef<unknown>;

  readonly permissionActions = PERMISSION_ACTIONS;
  id: string;
  roles: ManagedRole[] = [];
  activeTab: 'single' | 'bulk' = 'single';
  roleQuery = '';
  scopeQuery = '';
  scopeResourceType = '';
  scopeResults: PermissionScopePage = { scopes: [], totalElements: 0 };
  permissionAssignments: PermissionAssignment[] = [];
  saving = false;
  error: string;
  resetError: string;
  validationErrors: AccountValidationError[] = [];
  user: ManagedUser;
  showPassword = false;
  showPasswordConfirm = false;
  showResetPassword = false;
  showResetPasswordConfirm = false;
  private resetModalRef: NgbModalRef;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.pattern(usernamePattern)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.email],
    canLogIn: [true],
    password: ['', Validators.required],
    passwordConfirm: ['', Validators.required],
    requirePasswordChange: [true],
    roleIds: [[] as string[]],
    repositoryAdministrator: [false],
    contentManager: [false],
    confirmRepositoryAdministrator: [false],
  });
  bulk = this.fb.array<FormGroup>([]);
  resetForm = this.fb.group({ password: ['', Validators.required], passwordConfirm: ['', Validators.required], requirePasswordChange: [true] });

  constructor(private fb: FormBuilder, private accounts: AccountManagementService, private route: ActivatedRoute, private router: Router, private modal: NgbModal) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.accounts.roles().subscribe({ next: (roles) => this.roles = roles || [], error: () => this.error = 'admin.user-management.error.roles' });
    if (this.id) {
      this.form.removeControl('password');
      this.form.removeControl('passwordConfirm');
      this.form.removeControl('requirePasswordChange');
      this.accounts.user(this.id).subscribe({
        next: (user) => {
          this.user = user;
          this.permissionAssignments = this.normalizePermissionHierarchy(user.permissionAssignments || []);
          this.form.patchValue({ ...user, roleIds: user.roleIds || [], repositoryAdministrator: !!user.repositoryAdministrator, contentManager: !!user.contentManager });
        },
        error: () => this.error = 'admin.user-management.error.load',
      });
    } else {
      this.addBulkRow();
    }
    this.searchScopes();
  }

  get rows(): FormArray { return this.bulk; }
  get selectedRoleIds(): string[] { return this.form.value.roleIds || []; }
  get isCreating(): boolean { return !this.id; }
  get inheritedAssignments(): PermissionAssignment[] { return this.user?.inheritedPermissionAssignments || []; }
  get unmanagedAssignments(): PermissionAssignment[] { return this.user?.unmanagedPermissionAssignments || []; }
  get availableScopeRows(): PermissionScopeTreeRow[] { return this.buildScopeTree(this.scopeResults.scopes); }
  get selectedPermissionRows(): PermissionScopeTreeRow[] { return this.buildScopeTree(this.permissionAssignments, true); }

  scopeTypeLabel(resourceType: string): string {
    return {
      COMMUNITY: 'admin.user-management.scope-community',
      COLLECTION: 'admin.user-management.scope-collection',
      ITEM: 'admin.user-management.scope-item',
    }[resourceType] || resourceType;
  }

  addBulkRow(value: any = {}): void {
    this.bulk.push(this.fb.group({
      username: [value.username || '', [Validators.required, Validators.pattern(usernamePattern)]],
      firstName: [value.firstName || '', Validators.required],
      lastName: [value.lastName || '', Validators.required],
      email: [value.email || '', Validators.email],
    }));
  }
  removeBulkRow(index: number): void { if (this.bulk.length > 1) { this.bulk.removeAt(index); } }
  setTab(tab: 'single' | 'bulk'): void { this.activeTab = tab; this.validationErrors = []; this.error = undefined; }

  pasteBulk(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') || '';
    const rows = text.trim().split(/\r?\n/).filter(Boolean).map((line) => line.split(/\t|,/).map((cell) => cell.trim()));
    if (!rows.length) { return; }
    this.bulk.clear();
    rows.forEach(([username, firstName, lastName, email]) => this.addBulkRow({ username, firstName, lastName, email }));
  }

  toggleRole(id: string, selected: boolean): void {
    const roleIds = this.selectedRoleIds;
    this.form.patchValue({ roleIds: selected ? [...roleIds, id] : roleIds.filter((roleId) => roleId !== id) });
  }
  roleSelected(id: string): boolean { return this.selectedRoleIds.includes(id); }
  categorizedRoles(): [string, ManagedRole[]][] {
    const groups = new Map<string, ManagedRole[]>();
    const query = this.roleQuery.trim().toLocaleLowerCase();
    this.roles.filter((role) => !query || `${role.label} ${role.category} ${role.scope?.name || ''}`.toLocaleLowerCase().includes(query)).forEach((role) => {
      const category = role.category || 'Custom';
      groups.set(category, [...(groups.get(category) || []), role]);
    });
    return Array.from(groups.entries());
  }

  searchScopes(page = 0): void {
    this.accounts.permissionScopes(this.scopeQuery, this.scopeResourceType || undefined, page, 10).subscribe({
      next: (result) => {
        const scopes = Array.isArray(result) ? result : result.scopes || [];
        this.scopeResults = { scopes, totalElements: Array.isArray(result) ? scopes.length : result.totalElements || 0, page, size: 10 };
      },
      error: () => this.error = 'admin.user-management.error.scopes',
    });
  }
  addScope(scope: PermissionScope): void {
    if (this.scopeSelected(scope)) { return; }

    let fullControl = false;
    let actions: string[] = [];
    if (scope.resourceType === 'COLLECTION' && scope.parentResourceId) {
      const parent = this.permissionAssignments.find((assignment) =>
        assignment.resourceType === 'COMMUNITY' && assignment.resourceId === scope.parentResourceId);
      if (parent) {
        // Selecting the first child narrows an existing whole-community grant.
        // Carry its choices to that collection so the administrator does not
        // have to re-enter the permission set.
        fullControl = parent.fullControl;
        actions = [...parent.actions];
        this.permissionAssignments = this.permissionAssignments.filter((assignment) => assignment !== parent);
      }
    }
    this.permissionAssignments = [...this.permissionAssignments, { ...scope, fullControl, actions }];
  }
  removeScope(scope: PermissionScope): void {
    this.permissionAssignments = this.permissionAssignments.filter((assignment) => {
      const exactScope = assignment.resourceType === scope.resourceType && assignment.resourceId === scope.resourceId;
      const childOfScope = assignment.parentResourceType === scope.resourceType
        && assignment.parentResourceId === scope.resourceId;
      return !exactScope && !childOfScope;
    });
  }
  assignmentFor(scope: PermissionScope): PermissionAssignment | undefined { return this.permissionAssignments.find((assignment) => assignment.resourceType === scope.resourceType && assignment.resourceId === scope.resourceId); }
  scopeSelected(scope: PermissionScope): boolean {
    return !!this.assignmentFor(scope) || this.hasSelectedCollections(scope);
  }
  hasSelectedCollections(scope: PermissionScope): boolean {
    return scope.resourceType === 'COMMUNITY' && this.permissionAssignments.some((assignment) =>
      assignment.resourceType === 'COLLECTION' && assignment.parentResourceId === scope.resourceId);
  }
  groupFullControlSelected(community: PermissionScope): boolean {
    const collections = this.selectedCollectionsForCommunity(community);
    return collections.length > 0 && collections.every((assignment) => assignment.fullControl);
  }
  groupFullControlIndeterminate(community: PermissionScope): boolean {
    const collections = this.selectedCollectionsForCommunity(community);
    return collections.some((assignment) => assignment.fullControl) && !this.groupFullControlSelected(community);
  }
  groupActionSelected(community: PermissionScope, action: string): boolean {
    const collections = this.selectedCollectionsForCommunity(community).filter((assignment) => !assignment.fullControl);
    return collections.length > 0 && collections.every((assignment) => assignment.actions.includes(action));
  }
  groupActionIndeterminate(community: PermissionScope, action: string): boolean {
    const collections = this.selectedCollectionsForCommunity(community).filter((assignment) => !assignment.fullControl);
    return collections.some((assignment) => assignment.actions.includes(action))
      && !this.groupActionSelected(community, action);
  }
  setGroupFullControl(community: PermissionScope, enabled: boolean): void {
    this.selectedCollectionsForCommunity(community).forEach((assignment) => this.setFullControl(assignment, enabled));
  }
  setGroupAction(community: PermissionScope, action: string, enabled: boolean): void {
    this.selectedCollectionsForCommunity(community)
      .filter((assignment) => !assignment.fullControl)
      .forEach((assignment) => this.setAction(assignment, action, enabled));
  }
  collectionColumnLocked(assignment: PermissionAssignment, column: string): boolean {
    if (assignment.resourceType !== 'COLLECTION' || !assignment.parentResourceId) { return false; }
    const community: PermissionScope = { resourceType: 'COMMUNITY', resourceId: assignment.parentResourceId };
    return column === 'FULL_CONTROL'
      ? this.groupFullControlSelected(community)
      : this.groupFullControlSelected(community) || this.groupActionSelected(community, column);
  }
  assignmentLabel(assignment: PermissionScope): string { return assignment.resourceName || assignment.resourcePath || `${assignment.resourceType}: ${assignment.resourceId}`; }
  scopeKey(scope: PermissionScope): string { return `${scope.resourceType}:${scope.resourceId}`; }
  setFullControl(assignment: PermissionAssignment, enabled: boolean): void { assignment.fullControl = enabled; if (enabled) { assignment.actions = []; } }
  setAction(assignment: PermissionAssignment, action: string, enabled: boolean): void { assignment.actions = enabled ? [...new Set([...assignment.actions, action])] : assignment.actions.filter((value) => value !== action); }
  hasAction(assignment: PermissionAssignment, action: string): boolean { return assignment.fullControl || assignment.actions.includes(action); }

  togglePassword(field: 'password' | 'passwordConfirm' | 'resetPassword' | 'resetPasswordConfirm'): void {
    const property = `show${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof EPersonFormComponent;
    (this[property] as boolean) = !(this[property] as boolean);
  }
  passwordMatches(group: { value: any } = this.form): boolean { const value = group.value; return value.password === value.passwordConfirm; }

  submit(): void {
    if (this.id) { this.saveEdit(); return; }
    const users = this.activeTab === 'single' ? [this.userFromValue(this.form.value)] : this.bulk.controls.map((row) => this.userFromValue(row.value));
    const passwordInvalid = this.form.controls.password.invalid || this.form.controls.passwordConfirm.invalid || !this.passwordMatches();
    const missingAdminConfirmation = this.form.value.repositoryAdministrator && !this.form.value.confirmRepositoryAdministrator;
    if ((this.activeTab === 'single' ? this.form.invalid : this.bulk.invalid || passwordInvalid) || missingAdminConfirmation) {
      this.form.markAllAsTouched(); this.bulk.markAllAsTouched();
      this.error = missingAdminConfirmation ? 'admin.user-management.error.confirm-administrator' : 'admin.user-management.error.validation';
      return;
    }
    this.saving = true; this.validationErrors = [];
    this.accounts.create(this.creationPayload(users)).subscribe({ next: () => void this.router.navigate(['/access-control/epeople']), error: (response: HttpErrorResponse) => this.handleSaveError(response) });
  }
  saveEdit(): void {
    if (this.form.invalid || (this.form.value.repositoryAdministrator && !this.user?.repositoryAdministrator && !this.form.value.confirmRepositoryAdministrator)) {
      this.form.markAllAsTouched(); this.error = this.form.value.repositoryAdministrator ? 'admin.user-management.error.confirm-administrator' : 'admin.user-management.error.validation'; return;
    }
    const value = this.form.value;
    this.saving = true;
    this.accounts.update(this.id, { username: value.username, firstName: value.firstName, lastName: value.lastName, email: value.email || null, canLogIn: value.canLogIn, roleIds: value.roleIds || [], repositoryAdministrator: !!value.repositoryAdministrator, contentManager: !!value.contentManager, permissionAssignments: this.permissionAssignmentPayloads() }).subscribe({ next: () => void this.router.navigate(['/access-control/epeople']), error: (response: HttpErrorResponse) => this.handleSaveError(response) });
  }

  openReset(): void {
    this.resetForm.reset({ requirePasswordChange: true }); this.showResetPassword = false; this.showResetPasswordConfirm = false; this.resetError = undefined;
    this.resetModalRef = this.modal.open(this.resetPasswordModal, { ariaLabelledBy: 'reset-password-title', size: 'lg' });
  }
  resetPassword(): void {
    if (this.resetForm.invalid || !this.passwordMatches(this.resetForm)) { this.resetForm.markAllAsTouched(); this.resetError = 'admin.user-management.error.validation'; return; }
    this.resetError = undefined;
    this.accounts.resetPassword(this.id, this.resetForm.value.password, this.resetForm.value.requirePasswordChange !== false).subscribe({ next: () => this.resetModalRef?.close(), error: (response: HttpErrorResponse) => this.handleResetError(response) });
  }

  private creationPayload(users: any[]): any {
    const value = this.form.value;
    return { users, password: value.password, requirePasswordChange: value.requirePasswordChange !== false, roleIds: value.roleIds || [], repositoryAdministrator: !!value.repositoryAdministrator, contentManager: !!value.contentManager, permissionAssignments: this.permissionAssignmentPayloads() };
  }
  private permissionAssignmentPayloads(): Partial<PermissionAssignment>[] {
    return this.permissionAssignments.map(({ resourceType, resourceId, fullControl, actions }) =>
      ({ resourceType, resourceId, fullControl, actions }));
  }
  private normalizePermissionHierarchy(assignments: PermissionAssignment[]): PermissionAssignment[] {
    const narrowedCommunityIds = new Set(assignments
      .filter((assignment) => assignment.resourceType === 'COLLECTION' && assignment.parentResourceType === 'COMMUNITY')
      .map((assignment) => assignment.parentResourceId));
    return assignments.filter((assignment) => assignment.resourceType !== 'COMMUNITY'
      || !narrowedCommunityIds.has(assignment.resourceId));
  }
  private selectedCollectionsForCommunity(community: PermissionScope): PermissionAssignment[] {
    if (community.resourceType !== 'COMMUNITY') { return []; }
    return this.permissionAssignments.filter((assignment) => assignment.resourceType === 'COLLECTION'
      && assignment.parentResourceType === 'COMMUNITY'
      && assignment.parentResourceId === community.resourceId);
  }
  private buildScopeTree(scopes: PermissionScope[], includeAssignments = false): PermissionScopeTreeRow[] {
    const actualKeys = new Set(scopes.map((scope) => this.scopeKey(scope)));
    const byKey = new Map(scopes.map((scope) => [this.scopeKey(scope), scope]));
    const syntheticKeys = new Set<string>();

    scopes.forEach((scope) => {
      if (!scope.parentResourceId || !scope.parentResourceType) { return; }
      const parentKey = `${scope.parentResourceType}:${scope.parentResourceId}`;
      if (!byKey.has(parentKey)) {
        byKey.set(parentKey, {
          resourceType: scope.parentResourceType,
          resourceId: scope.parentResourceId,
          resourceName: scope.parentResourceName,
          resourcePath: scope.parentResourcePath,
        });
        syntheticKeys.add(parentKey);
      }
    });

    const children = new Map<string, PermissionScope[]>();
    const roots: PermissionScope[] = [];
    byKey.forEach((scope) => {
      const parentKey = scope.parentResourceId && scope.parentResourceType
        ? `${scope.parentResourceType}:${scope.parentResourceId}` : undefined;
      if (parentKey && byKey.has(parentKey)) {
        children.set(parentKey, [...(children.get(parentKey) || []), scope]);
      } else {
        roots.push(scope);
      }
    });

    const compareScopes = (left: PermissionScope, right: PermissionScope): number =>
      (left.resourcePath || left.resourceName || left.resourceId).localeCompare(
        right.resourcePath || right.resourceName || right.resourceId, undefined, { sensitivity: 'base' });
    const rows: PermissionScopeTreeRow[] = [];
    const visit = (scope: PermissionScope, depth: number): void => {
      const key = this.scopeKey(scope);
      const childScopes = (children.get(key) || []).sort(compareScopes);
      rows.push({
        scope,
        assignment: includeAssignments && actualKeys.has(key) ? scope as PermissionAssignment : undefined,
        depth,
        hasChildren: childScopes.length > 0,
        synthetic: syntheticKeys.has(key),
      });
      childScopes.forEach((child) => visit(child, depth + 1));
    };
    roots.sort(compareScopes).forEach((scope) => visit(scope, 0));
    return rows;
  }
  private userFromValue(value: any): any { return { username: value.username, firstName: value.firstName, lastName: value.lastName, email: value.email || undefined, canLogIn: value.canLogIn }; }
  private handleSaveError(response: HttpErrorResponse): void { this.validationErrors = response.error?.errors || []; this.error = this.validationErrors.length ? 'admin.user-management.error.validation' : 'admin.user-management.error.save'; this.saving = false; }
  private handleResetError(response: HttpErrorResponse): void { this.resetError = response.error?.errors?.length ? 'admin.user-management.error.validation' : 'admin.user-management.error.save'; }
}
