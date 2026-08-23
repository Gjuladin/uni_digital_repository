import {
  Component,
  Input,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { hasValue } from '@dspace/shared/utils/empty.util';
import { TranslateModule } from '@ngx-translate/core';

import { StartsWithAbstractComponent } from '../starts-with-abstract.component';

/**
 * A switchable component rendering StartsWith options for the type "Text".
 */
@Component({
  selector: 'ds-starts-with-text',
  styleUrls: ['./starts-with-text.component.scss'],
  templateUrl: './starts-with-text.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class StartsWithTextComponent extends StartsWithAbstractComponent {

  /**
   * Set by the browse page from its logical browse-definition capability.
   * Unsupported text browses keep DSpace's ordinary startsWith behavior.
   */
  @Input() supportsContains = false;

  /**
   * Get startsWith as text;
   */
  getStartsWith() {
    if (hasValue(this.startsWith)) {
      return this.startsWith;
    } else {
      return '';
    }
  }

  /**
   * Add/Change the url query parameter startsWith using the local variable
   */
  setStartsWithParam(resetPage = true) {
    if (this.startsWith === '0-9') {
      this.startsWith = '0';
    }
    super.setStartsWithParam(resetPage);
  }

  protected getQueryParamName(): string {
    return this.supportsContains ? 'contains' : super.getQueryParamName();
  }

  protected getRouteValue(params: Record<string, string | undefined>): string | undefined {
    if (!this.supportsContains) {
      return super.getRouteValue(params);
    }

    // A manually supplied contains parameter wins for supported browses. If it
    // is blank, preserve the normal startsWith URL rather than clearing it.
    return hasValue(params.contains) ? params.contains : params.startsWith;
  }

  protected getQueryParams(): Record<string, string | null | undefined> {
    if (!this.supportsContains) {
      return super.getQueryParams();
    }

    return {
      contains: this.startsWith,
      startsWith: null,
    };
  }

}
