import {
  AsyncPipe,
  NgComponentOutlet,
} from '@angular/common';
import {
  Component,
  Inject,
  Injector,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { NavbarSectionComponent as BaseComponent } from '../../../../../app/navbar/navbar-section/navbar-section.component';
import { MenuService } from '../../../../../app/shared/menu/menu.service';
import { MenuID } from '../../../../../app/shared/menu/menu-id.model';
import { LinkMenuItemModel } from '../../../../../app/shared/menu/menu-item/models/link.model';
import { rendersSectionForMenu } from '../../../../../app/shared/menu/menu-section.decorator';
import { MenuSection } from '../../../../../app/shared/menu/menu-section.model';

const COMMUNITY_LIST_MENU_TEXT = 'menu.section.browse_global_communities_and_collections';
const VIEW_ALL_SECTION_ID = 'uist-all-communities-and-collections';

/**
 * A themed public-menu section. The stock DSpace menu decides whether a
 * section is expandable before its asynchronously loaded child links exist.
 * UIST's Communities & Collections entry therefore owns its small dropdown
 * shell and updates as those links are added to MenuService.
 */
@Component({
  selector: 'ds-uist-navbar-section',
  templateUrl: './navbar-section.component.html',
  styleUrls: ['./navbar-section.component.scss'],
  imports: [
    AsyncPipe,
    NgComponentOutlet,
    RouterLink,
    TranslateModule,
  ],
})
@rendersSectionForMenu(MenuID.PUBLIC, false, 'uist')
export class NavbarSectionComponent extends BaseComponent {
  private readonly childSections = new Map<string, Observable<MenuSection[]>>();

  constructor(
    @Inject('sectionDataProvider') public override section: MenuSection,
    protected override menuService: MenuService,
    protected override injector: Injector,
  ) {
    super(section, menuService, injector);
  }

  get isCommunitiesAndCollections(): boolean {
    return this.communitiesAndCollectionsLabel === COMMUNITY_LIST_MENU_TEXT;
  }

  get communitiesAndCollectionsLabel(): string {
    return (this.section.model as { text?: string }).text ?? '';
  }

  isViewAll(section: MenuSection): boolean {
    return section.id === VIEW_ALL_SECTION_ID;
  }

  sectionText(section: MenuSection): string {
    return (section.model as LinkMenuItemModel).text;
  }

  sectionLink(section: MenuSection): string {
    return (section.model as LinkMenuItemModel).link;
  }

  getChildSections(parentID: string): Observable<MenuSection[]> {
    if (!this.childSections.has(parentID)) {
      this.childSections.set(parentID, this.menuService.getSubSectionsByParentID(this.menuID, parentID));
    }
    return this.childSections.get(parentID);
  }
}
