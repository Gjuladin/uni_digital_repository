import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { ContextHelpToggleComponent } from '../../../../app/header/context-help-toggle/context-help-toggle.component';
import { ThemedNavbarComponent } from '../../../../app/navbar/themed-navbar.component';
import { ThemedSearchNavbarComponent } from '../../../../app/search-navbar/themed-search-navbar.component';
import { ThemedAuthNavMenuComponent } from '../../../../app/shared/auth-nav-menu/themed-auth-nav-menu.component';
import { HostWindowService } from '../../../../app/shared/host-window.service';
import { ImpersonateNavbarComponent } from '../../../../app/shared/impersonate-navbar/impersonate-navbar.component';
import { ThemedLangSwitchComponent } from '../../../../app/shared/lang-switch/themed-lang-switch.component';
import { MenuService } from '../../../../app/shared/menu/menu.service';
import { MenuServiceStub } from '../../../../app/shared/menu/menu-service.stub';
import { HeaderComponent } from './header.component';

describe('UIST HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let isMobile$: BehaviorSubject<boolean>;
  let menuCollapsed$: BehaviorSubject<boolean>;
  let menuService: MenuServiceStub;

  beforeEach(async () => {
    isMobile$ = new BehaviorSubject(false);
    menuCollapsed$ = new BehaviorSubject(true);
    menuService = new MenuServiceStub();
    spyOn(menuService, 'isMenuCollapsed').and.returnValue(menuCollapsed$);

    await TestBed.configureTestingModule({
      imports: [
        HeaderComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: HostWindowService, useValue: { isUpTo: () => isMobile$ } },
        { provide: MenuService, useValue: menuService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(HeaderComponent, {
        remove: {
          imports: [
            ContextHelpToggleComponent,
            ImpersonateNavbarComponent,
            RouterLink,
            ThemedAuthNavMenuComponent,
            ThemedLangSwitchComponent,
            ThemedNavbarComponent,
            ThemedSearchNavbarComponent,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    fixture.detectChanges();
  });

  it('renders the main navbar as a separate desktop row', () => {
    expect(fixture.debugElement.query(By.css('#desktop-navbar ds-navbar'))).not.toBeNull();
  });

  it('leaves the navbar to the mobile header wrapper on small screens', () => {
    isMobile$.next(true);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#desktop-navbar'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.navbar-toggler'))).not.toBeNull();
  });

  it('reports the mobile navbar expansion state on its toggle', () => {
    isMobile$.next(true);
    fixture.detectChanges();
    const toggle = fixture.debugElement.query(By.css('.navbar-toggler')).nativeElement as HTMLButtonElement;

    expect(toggle.getAttribute('aria-expanded')).toEqual('false');

    menuCollapsed$.next(false);
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toEqual('true');
  });
});
