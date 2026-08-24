import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

import { AccountManagementService, ManagedUser, ManagedUserPage } from './account-management.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';

/** Site-administrator user directory backed by the account-management API. */
@Component({
  selector: 'ds-epeople-registry',
  templateUrl: './epeople-registry.component.html',
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
})
export class EPeopleRegistryComponent implements OnInit {
  readonly pageSize = 25;
  page = 0;
  result: ManagedUserPage = { users: [], totalElements: 0 };
  loading = false;
  deletingUserId?: string;
  error: string;
  searchForm = this.fb.group({ query: [''] });

  constructor(
    private accounts: AccountManagementService,
    private fb: FormBuilder,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void { this.load(); }

  load(page = this.page): void {
    this.loading = true;
    this.error = undefined;
    this.accounts.users(this.searchForm.value.query || '', page, this.pageSize).subscribe({
      next: (result) => {
        this.result = { users: result.users || (result as any).content || [], totalElements: result.totalElements || (result as any).total || 0 };
        this.page = page;
        this.loading = false;
      },
      error: () => { this.error = 'admin.user-management.error.load'; this.loading = false; },
    });
  }

  submitSearch(): void { this.load(0); }
  previous(): void { if (this.page > 0) { this.load(this.page - 1); } }
  next(): void { if ((this.page + 1) * this.pageSize < this.result.totalElements) { this.load(this.page + 1); } }
  displayName(user: ManagedUser): string { return `${user.firstName || ''} ${user.lastName || ''}`.trim(); }

  confirmDelete(user: ManagedUser): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.name = this.displayName(user) || user.username || user.email || user.id;
    modalRef.componentInstance.headerLabel = 'admin.user-management.delete-confirmation-title';
    modalRef.componentInstance.infoLabel = 'admin.user-management.delete-confirmation-info';
    modalRef.componentInstance.cancelLabel = 'admin.user-management.cancel';
    modalRef.componentInstance.confirmLabel = 'admin.user-management.delete';
    modalRef.componentInstance.brandColor = 'danger';
    modalRef.componentInstance.confirmIcon = 'fas fa-trash';
    modalRef.componentInstance.response.pipe(take(1)).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.delete(user);
      }
    });
  }

  private delete(user: ManagedUser): void {
    this.deletingUserId = user.id;
    this.error = undefined;
    this.accounts.delete(user.id).subscribe({
      next: () => {
        this.deletingUserId = undefined;
        this.load(this.result.users.length === 1 && this.page > 0 ? this.page - 1 : this.page);
      },
      error: () => {
        this.deletingUserId = undefined;
        this.error = 'admin.user-management.error.delete';
      },
    });
  }
}
