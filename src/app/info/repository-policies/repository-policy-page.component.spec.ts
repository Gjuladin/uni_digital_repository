import { TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  provideRouter,
} from '@angular/router';
import { APP_CONFIG } from '@dspace/config/app-config.interface';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { REPOSITORY_POLICY_VERSION } from './repository-policy-documents';
import { RepositoryPolicyPageComponent } from './repository-policy-page.component';

describe('Repository information pages', () => {
  it('updates the article when navigating between pages without recreating the component', async () => {
    const data = new BehaviorSubject({ policyId: 'repository-policies' });
    await TestBed.configureTestingModule({
      imports: [RepositoryPolicyPageComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { data } },
        { provide: APP_CONFIG, useValue: { info: { repositoryPolicyPublication: { enabled: true, version: REPOSITORY_POLICY_VERSION } } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(RepositoryPolicyPageComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('article').textContent).toContain('without individual administrator approval');
    expect(element.querySelector('article').textContent).not.toContain('Pavel Taskov');
    expect(element.textContent).not.toContain('Effective undefined');
    expect(element.querySelectorAll('nav a').length).toBe(4);

    data.next({ policyId: 'privacy' });
    fixture.detectChanges();
    expect(element.querySelector('article h1').textContent).toContain('Privacy Notice');
    expect(element.querySelector('article a[href*="UIST-Privacy-Policy.pdf"]')).toBeTruthy();

    data.next({ policyId: 'accessibility-statement' });
    fixture.detectChanges();
    expect(element.querySelector('article h1').textContent).toContain('Accessibility Statement');

    data.next({ policyId: 'contact' });
    fixture.detectChanges();
    expect(element.querySelector('article').textContent).toContain('Pavel Taskov');
    expect(element.querySelector('article a[href="mailto:pavel.taskov@uist.edu.mk"]')).toBeTruthy();
  });
});
