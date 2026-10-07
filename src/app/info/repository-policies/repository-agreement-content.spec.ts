import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { SiteDataService } from '@dspace/core/data/site-data.service';
import { LocaleService } from '@dspace/core/locale/locale.service';
import { TranslateModule } from '@ngx-translate/core';

import { EndUserAgreementContentComponent } from '../end-user-agreement/end-user-agreement-content/end-user-agreement-content.component';
import { REPOSITORY_POLICY_VERSION } from './repository-policy-documents';

describe('UIST agreement content', () => {
  it('uses repository policies instead of default or site-supplied boilerplate', async () => {
    const site = jasmine.createSpyObj('SiteDataService', ['find']);
    await TestBed.configureTestingModule({
      imports: [EndUserAgreementContentComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: SiteDataService, useValue: site },
        { provide: LocaleService, useValue: {} },
        { provide: APP_CONFIG, useValue: { info: { repositoryPolicyPublication: { enabled: true, version: REPOSITORY_POLICY_VERSION } } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(EndUserAgreementContentComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('h1').textContent).toBe('UIST Repository Policies');
    expect(element.textContent).toContain('CC0 1.0');
    expect(element.textContent).toContain('without individual administrator approval');
    expect(site.find).not.toHaveBeenCalled();
  });
});
