import {
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { PaginationService } from '@dspace/core/pagination/pagination.service';
import { hasValue } from '@dspace/shared/utils/empty.util';
import { Subscription } from 'rxjs';

import { StartsWithType } from './starts-with-type';

/**
 * An abstract component to render StartsWith options
 */
@Component({
  selector: 'ds-start-with-abstract',
  template: '',
})
export abstract class StartsWithAbstractComponent implements OnInit, OnDestroy {

  @Input() paginationId: string;

  @Input() startsWithOptions: (string | number)[];

  @Input() type: StartsWithType;

  /**
   * The currently selected startsWith in string format
   */
  startsWith: string;

  /**
   * The formdata controlling the StartsWith input
   */
  formData: UntypedFormGroup;

  /**
   * List of subscriptions
   */
  subs: Subscription[] = [];

  public constructor(
    protected paginationService: PaginationService,
    protected route: ActivatedRoute,
    protected router: Router,
  ) {
  }

  ngOnInit(): void {
    this.subs.push(
      this.route.queryParams.subscribe((params) => {
        const routeValue = this.getRouteValue(params);
        if (hasValue(routeValue)) {
          this.setStartsWith(routeValue);
        }
      }),
    );
    this.formData = new UntypedFormGroup({
      startsWith: new UntypedFormControl(),
    });
  }

  /**
   * Get startsWith
   */
  getStartsWith(): any {
    return this.startsWith;
  }

  /**
   * Set the startsWith by string
   * @param startsWith
   */
  setStartsWith(startsWith: string) {
    this.startsWith = startsWith;
  }

  protected getQueryParamName(): string {
    return 'startsWith';
  }

  /**
   * Resolve the value used by the control from the current route.
   * Subclasses may implement compatibility precedence for multiple filters.
   */
  protected getRouteValue(params: Record<string, string | undefined>): string | undefined {
    return params[this.getQueryParamName()];
  }

  protected getQueryParams(): Record<string, string | null | undefined> {
    return { [this.getQueryParamName()]: this.startsWith };
  }

  /**
   * Add/Change the url query parameter startsWith using the local variable
   */
  setStartsWithParam(resetPage = true) {
    if (this.startsWith === '-1') {
      this.startsWith = undefined;
    }
    const queryParams = this.getQueryParams();
    if (resetPage) {
      this.paginationService.updateRoute(this.paginationId, { page: 1 }, queryParams, undefined, { queryParamsHandling: '' });
    } else {
      void this.router.navigate([], {
        queryParams,
      });
    }
  }

  /**
   * Submit the form data. Called when clicking a submit button on the form.
   * @param data
   */
  submitForm(data) {
    this.startsWith = data.startsWith;
    this.setStartsWithParam();
  }

  ngOnDestroy(): void {
    this.subs.filter((sub) => hasValue(sub)).forEach((sub) => sub.unsubscribe());
  }
}
