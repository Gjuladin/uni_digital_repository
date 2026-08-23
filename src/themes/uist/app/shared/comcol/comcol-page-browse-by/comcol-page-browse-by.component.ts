import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs/operators';

import {
  ComcolPageBrowseByComponent as BaseComponent,
  ComColPageNavOption,
} from '../../../../../../app/shared/comcol/comcol-page-browse-by/comcol-page-browse-by.component';

export const UIST_COMCOL_BROWSE_OPTION_IDS = new Set([
  'browse_dateissued',
  'browse_author',
  'browse_title',
]);

/** Keep the DSpace search/comcol tabs and only UIST's three browse tabs. */
export function filterUistComcolBrowseOptions(options: ComColPageNavOption[]): ComColPageNavOption[] {
  return options.filter((option) =>
    !option.id.startsWith('browse_') || UIST_COMCOL_BROWSE_OPTION_IDS.has(option.id),
  );
}

@Component({
  selector: 'ds-themed-comcol-page-browse-by',
  templateUrl: '../../../../../../app/shared/comcol/comcol-page-browse-by/comcol-page-browse-by.component.html',
  styleUrls: ['../../../../../../app/shared/comcol/comcol-page-browse-by/comcol-page-browse-by.component.scss'],
  imports: [
    AsyncPipe,
    FormsModule,
    RouterLink,
    TranslateModule,
  ],
})
export class ComcolPageBrowseByComponent extends BaseComponent {
  override ngOnInit(): void {
    super.ngOnInit();
    this.allOptions$ = this.allOptions$.pipe(map(filterUistComcolBrowseOptions));
  }
}
