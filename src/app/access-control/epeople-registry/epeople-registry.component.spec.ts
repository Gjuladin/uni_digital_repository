import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AccountManagementService } from './account-management.service';
import { EPeopleRegistryComponent } from './epeople-registry.component';

describe('EPeopleRegistryComponent', () => {
  const modal = jasmine.createSpyObj<NgbModal>('modal', ['open']);

  it('requests 25 users per page', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['users', 'delete']);
    accounts.users.and.returnValue(of({ users: [], totalElements: 0 }));
    TestBed.configureTestingModule({
      imports: [EPeopleRegistryComponent, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: AccountManagementService, useValue: accounts },
        { provide: NgbModal, useValue: modal },
      ],
    });
    const fixture = TestBed.createComponent(EPeopleRegistryComponent);
    fixture.detectChanges();
    expect(accounts.users).toHaveBeenCalledWith('', 0, 25);
  });

  it('deletes a user after confirmation and refreshes the page', () => {
    const accounts = jasmine.createSpyObj<AccountManagementService>('accounts', ['users', 'delete']);
    accounts.users.and.returnValue(of({ users: [], totalElements: 0 }));
    accounts.delete.and.returnValue(of(undefined));
    modal.open.and.returnValue({ componentInstance: { response: of(true) } } as any);
    TestBed.configureTestingModule({
      imports: [EPeopleRegistryComponent, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: AccountManagementService, useValue: accounts },
        { provide: NgbModal, useValue: modal },
      ],
    });
    const fixture = TestBed.createComponent(EPeopleRegistryComponent);
    fixture.detectChanges();

    fixture.componentInstance.confirmDelete({
      id: 'user-id', firstName: 'Ada', lastName: 'Lovelace', canLogIn: true, passwordChangeRequired: false,
    });

    expect(accounts.delete).toHaveBeenCalledWith('user-id');
    expect(accounts.users).toHaveBeenCalledTimes(2);
  });
});
