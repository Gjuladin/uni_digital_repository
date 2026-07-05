import {
  AsyncPipe,
  DatePipe,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { FooterComponent as BaseComponent } from '../../../../app/footer/footer.component';

@Component({
  selector: 'ds-themed-footer',
  styleUrls: ['./footer-v2.component.scss'],
  templateUrl: './footer-v2.component.html',
  imports: [
    AsyncPipe,
    DatePipe,
    RouterLink,
    TranslateModule,
  ],
})
export class FooterComponent extends BaseComponent {
  override ngOnInit(): void {
    super.ngOnInit();
  }
}
