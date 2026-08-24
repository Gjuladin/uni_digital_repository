import { TranslateService } from '@ngx-translate/core';

export function getMockTranslateService(): TranslateService {
  const service = jasmine.createSpyObj('translateService', {
    get: jasmine.createSpy('get'),
    use: jasmine.createSpy('use'),
    instant: jasmine.createSpy('instant'),
    setFallbackLang: jasmine.createSpy('setFallbackLang'),
  });
  service.instant.and.callFake((key: string) => ({
    'footer.uist.title': 'UIST Digital Repository',
    'repository.institution': 'University of Information Science and Technology "St. Paul the Apostle"',
    'repository.website': 'https://uist.edu.mk/',
    'repository.description': 'Open access scholarly works, publications, theses, conference papers, and research outputs from UIST "St. Paul the Apostle" in Ohrid.',
    'repository.alternate-name': 'UIST',
    'repository.address.street': 'Partizanska bb',
    'repository.address.locality': 'Ohrid',
    'repository.address.postal-code': '6000',
    'repository.address.country': 'MK',
  }[key] ?? key));
  return service;
}
