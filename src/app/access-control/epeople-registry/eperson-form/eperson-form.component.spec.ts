import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AccountManagementService } from '../account-management.service';
import { EPersonFormComponent } from './eperson-form.component';

describe('EPersonFormComponent', () => {
  it('creates with mandatory password change by default', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'create', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.create.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    component.ngOnInit();
    expect(component.form.value.requirePasswordChange).toBeTrue();
  });

  it('parses tab-separated bulk rows', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']); accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance; component.ngOnInit();
    component.pasteBulk({ preventDefault: () => undefined, clipboardData: { getData: () => 'ada\tAda\tLovelace\tada@example.test' } } as any);
    expect(component.rows.at(0).value.username).toBe('ada');
  });

  it('turns full control into every scoped permission action', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    component.addScope({ resourceType: 'ITEM', resourceId: 'item-1', resourceName: 'Test item' });
    const assignment = component.permissionAssignments[0];
    component.setFullControl(assignment, true);
    expect(assignment.actions).toEqual([]);
    expect(assignment.fullControl).toBeTrue();
  });

  it('keeps all selected partial actions distinct from full control', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    component.addScope({ resourceType: 'ITEM', resourceId: 'item-1' });
    const assignment = component.permissionAssignments[0];
    ['READ', 'ADD', 'WRITE', 'DELETE'].forEach((action) => component.setAction(assignment, action, true));
    expect(assignment.fullControl).toBeFalse();
    expect(assignment.actions).toEqual(['READ', 'ADD', 'WRITE', 'DELETE']);
  });

  it('keeps scoped permissions independent from Content Manager', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    component.addScope({ resourceType: 'ITEM', resourceId: 'item-1' });
    component.form.patchValue({ contentManager: false });
    expect(component.form.value.contentManager).toBeFalse();
    expect(component.permissionAssignments).toHaveSize(1);
  });

  it('renders collections beneath their community regardless of API order', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    component.scopeResults = { scopes: [
      { resourceType: 'COLLECTION', resourceId: 'collection-1', resourceName: 'Articles', resourcePath: 'Journals / Articles', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1', parentResourceName: 'Journals', parentResourcePath: 'Journals' },
      { resourceType: 'COMMUNITY', resourceId: 'community-1', resourceName: 'Journals', resourcePath: 'Journals' },
    ], totalElements: 2 };

    expect(component.availableScopeRows.map((row) => row.scope.resourceId)).toEqual(['community-1', 'collection-1']);
    expect(component.availableScopeRows[0].hasChildren).toBeTrue();
    expect(component.availableScopeRows[1].depth).toBe(1);
  });

  it('adds a community parent row when only its selected collection is present', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    component.addScope({ resourceType: 'COLLECTION', resourceId: 'collection-1', resourceName: 'Articles', resourcePath: 'Journals / Articles', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1', parentResourceName: 'Journals', parentResourcePath: 'Journals' });

    expect(component.selectedPermissionRows).toHaveSize(2);
    expect(component.selectedPermissionRows[0].scope.resourceId).toBe('community-1');
    expect(component.selectedPermissionRows[0].synthetic).toBeTrue();
    expect(component.selectedPermissionRows[0].hasChildren).toBeTrue();
    expect(component.selectedPermissionRows[1].assignment?.resourceId).toBe('collection-1');
    expect(component.selectedPermissionRows[1].depth).toBe(1);
  });

  it('narrows a whole-community grant when its first collection is selected', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    const community = { resourceType: 'COMMUNITY', resourceId: 'community-1', resourceName: 'Journals' };
    const collection = { resourceType: 'COLLECTION', resourceId: 'collection-1', resourceName: 'Articles', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1', parentResourceName: 'Journals' };

    component.addScope(community);
    component.setFullControl(component.permissionAssignments[0], true);
    component.addScope(collection);

    expect(component.permissionAssignments).toHaveSize(1);
    expect(component.permissionAssignments[0].resourceId).toBe('collection-1');
    expect(component.permissionAssignments[0].fullControl).toBeTrue();
    expect(component.selectedPermissionRows[0].synthetic).toBeTrue();
  });

  it('treats a collection parent as selected context and removes its whole selected branch', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    const community = { resourceType: 'COMMUNITY', resourceId: 'community-1', resourceName: 'Journals' };
    component.addScope({ resourceType: 'COLLECTION', resourceId: 'collection-1', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1', parentResourceName: 'Journals' });
    component.addScope({ resourceType: 'COLLECTION', resourceId: 'collection-2', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1', parentResourceName: 'Journals' });

    expect(component.scopeSelected(community)).toBeTrue();
    expect(component.hasSelectedCollections(community)).toBeTrue();

    component.removeScope(community);
    expect(component.permissionAssignments).toEqual([]);
  });

  it('normalizes legacy community and collection grants into selected-collections-only', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'user', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    accounts.user.and.returnValue(of({ permissionAssignments: [
      { resourceType: 'COMMUNITY', resourceId: 'community-1', fullControl: true, actions: [] },
      { resourceType: 'COLLECTION', resourceId: 'collection-1', fullControl: true, actions: [], parentResourceType: 'COMMUNITY', parentResourceId: 'community-1', parentResourceName: 'Journals' },
    ] } as any));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => 'user-1' } } } },
    ] });

    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    component.ngOnInit();

    expect(component.permissionAssignments.map((assignment) => assignment.resourceId)).toEqual(['collection-1']);
    expect(component.selectedPermissionRows[0].synthetic).toBeTrue();
  });

  it('bulk-selects a community action and locks only that child column', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    const community = { resourceType: 'COMMUNITY', resourceId: 'community-1' };
    component.addScope({ resourceType: 'COLLECTION', resourceId: 'collection-1', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1' });
    component.addScope({ resourceType: 'COLLECTION', resourceId: 'collection-2', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1' });
    component.setAction(component.permissionAssignments[0], 'READ', true);

    expect(component.groupActionIndeterminate(community, 'READ')).toBeTrue();
    component.setGroupAction(community, 'READ', true);

    expect(component.groupActionSelected(community, 'READ')).toBeTrue();
    expect(component.permissionAssignments.every((assignment) => assignment.actions.includes('READ'))).toBeTrue();
    expect(component.permissionAssignments.every((assignment) => component.collectionColumnLocked(assignment, 'READ'))).toBeTrue();
    expect(component.permissionAssignments.every((assignment) => !component.collectionColumnLocked(assignment, 'WRITE'))).toBeTrue();

    component.setGroupAction(community, 'READ', false);
    expect(component.permissionAssignments.every((assignment) => !assignment.actions.includes('READ'))).toBeTrue();
    expect(component.permissionAssignments.every((assignment) => !component.collectionColumnLocked(assignment, 'READ'))).toBeTrue();
  });

  it('keeps bulk action state explicit when selected collections mix full and partial control', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['roles', 'permissionScopes']);
    accounts.roles.and.returnValue(of([])); accounts.permissionScopes.and.returnValue(of({ scopes: [], totalElements: 0 }));
    TestBed.configureTestingModule({ imports: [EPersonFormComponent, RouterTestingModule, TranslateModule.forRoot()], providers: [
      { provide: AccountManagementService, useValue: accounts },
      { provide: NgbModal, useValue: jasmine.createSpyObj('modal', ['open']) },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null } } } },
    ] });
    const component = TestBed.createComponent(EPersonFormComponent).componentInstance;
    const community = { resourceType: 'COMMUNITY', resourceId: 'community-1' };
    component.addScope({ resourceType: 'COLLECTION', resourceId: 'collection-1', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1' });
    component.addScope({ resourceType: 'COLLECTION', resourceId: 'collection-2', parentResourceType: 'COMMUNITY', parentResourceId: 'community-1' });
    component.setFullControl(component.permissionAssignments[0], true);

    expect(component.groupFullControlIndeterminate(community)).toBeTrue();
    component.setGroupAction(community, 'READ', true);
    expect(component.permissionAssignments[0].actions).toEqual([]);
    expect(component.permissionAssignments[1].actions).toEqual(['READ']);
    expect(component.groupActionSelected(community, 'READ')).toBeTrue();

    component.setGroupFullControl(community, true);
    expect(component.groupFullControlSelected(community)).toBeTrue();
    expect(component.groupActionSelected(community, 'READ')).toBeFalse();
    expect(component.permissionAssignments.every((assignment) => assignment.fullControl && assignment.actions.length === 0)).toBeTrue();
  });
});
