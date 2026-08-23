import { FooterComponent } from './app/footer/footer.component';
import { HeaderComponent } from './app/header/header.component';
import { HomeNewsComponent } from './app/home-page/home-news/home-news.component';
import { HomePageComponent } from './app/home-page/home-page.component';
import { NavbarComponent } from './app/navbar/navbar.component';
import { NavbarSectionComponent } from './app/navbar/navbar-section/navbar-section.component';
import { COMPONENTS } from './eager-theme-components';
import { LISTABLE_COMPONENTS } from './lazy-listable-components';

describe('UIST theme registration', () => {
  it('registers each intentional eager override', () => {
    expect(COMPONENTS).toEqual([
      HomePageComponent,
      HeaderComponent,
      NavbarComponent,
      NavbarSectionComponent,
      FooterComponent,
      HomeNewsComponent,
    ]);
  });

  it('uses the DSpace 10 listable components without legacy shadow copies', () => {
    expect(LISTABLE_COMPONENTS).toEqual([]);
  });
});
