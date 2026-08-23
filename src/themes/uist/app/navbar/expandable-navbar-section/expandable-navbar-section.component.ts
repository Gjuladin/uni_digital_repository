import {
  AsyncPipe,
  NgComponentOutlet,
} from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import {
  first,
  map,
} from 'rxjs/operators';

import { ExpandableNavbarSectionComponent as BaseComponent } from '../../../../../app/navbar/expandable-navbar-section/expandable-navbar-section.component';
import { slide } from '../../../../../app/shared/animations/slide';
import { LinkMenuItemModel } from '../../../../../app/shared/menu/menu-item/models/link.model';
import { TextMenuItemModel } from '../../../../../app/shared/menu/menu-item/models/text.model';
import { MenuItemType } from '../../../../../app/shared/menu/menu-item-type.model';
import { MenuSection } from '../../../../../app/shared/menu/menu-section.model';

/** The browse definitions intentionally offered by the UIST public interface. */
export const UIST_BROWSE_DEFINITION_IDS = new Set(['dateissued', 'author', 'title']);
const COMMUNITY_LIST_MENU_TEXT = 'menu.section.browse_global_communities_and_collections';
const VIEW_ALL_SECTION_ID = 'uist-all-communities-and-collections';

/**
 * Remove backend-provided browse definitions that are not part of the UIST
 * public navigation. The REST API remains authoritative for direct URLs.
 */
export function filterUistBrowseMenuSections(sections: MenuSection[]): MenuSection[] {
  return sections.filter((section) => {
    const model = section.model as LinkMenuItemModel;
    if (model.type !== MenuItemType.LINK || !model.link.startsWith('/browse/')) {
      return true;
    }

    return UIST_BROWSE_DEFINITION_IDS.has(model.link.slice('/browse/'.length));
  });
}

@Component({
  selector: 'ds-themed-expandable-navbar-section',
  templateUrl: './expandable-navbar-section.component.html',
  styleUrls: ['../../../../../app/navbar/expandable-navbar-section/expandable-navbar-section.component.scss'],
  animations: [slide],
  imports: [
    AsyncPipe,
    NgComponentOutlet,
    RouterLink,
    TranslateModule,
  ],
})
export class ExpandableNavbarSectionComponent extends BaseComponent {
  private readonly childSections = new Map<string, Observable<MenuSection[]>>();
  private readonly expandedMobileCommunities = new Set<string>();

  override ngOnInit(): void {
    super.ngOnInit();

    this.subs.push(this.active$.subscribe((isActive) => {
      if (!isActive) {
        this.expandedMobileCommunities.clear();
      }
    }));

    if ((this.section.model as TextMenuItemModel)?.text === 'menu.section.browse_global') {
      this.subSections$ = this.subSections$.pipe(map(filterUistBrowseMenuSections));
    }
  }

  get isCommunitiesAndCollections(): boolean {
    return (this.section.model as TextMenuItemModel)?.text === COMMUNITY_LIST_MENU_TEXT;
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

  /**
   * Pointer clicks toggle dropdowns on mobile only. Native button keyboard
   * activation remains available at every viewport size, while desktop
   * pointer interaction is owned by hover.
   */
  onTriggerClick(event: Event): void {
    event.preventDefault();
    const isKeyboardActivation = event instanceof MouseEvent && event.detail === 0;
    this.isMobile$.pipe(first()).subscribe((isMobile) => {
      if (isMobile || isKeyboardActivation) {
        this.toggleTopLevelSection(event);
      }
    });
  }

  onTriggerKeyDown(event: KeyboardEvent): void {
    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      event.stopPropagation();
      this.toggleTopLevelSection(event);
    } else if (event.code === 'ArrowDown') {
      this.focusOnFirstChildSection = true;
      this.activateTopLevelSection(event);
    } else {
      this.keyDown(event);
    }
  }

  private toggleTopLevelSection(event: Event): void {
    if (this.section.model?.disabled) {
      return;
    }
    this.menuService.getMenuTopSections(this.menuID).pipe(first()).subscribe((sections) => {
      sections
        .filter((section) => section.id !== this.section.id && section.active)
        .forEach((section) => this.menuService.deactivateSection(this.menuID, section.id));
      this.toggleSection(event);
    });
  }

  private activateTopLevelSection(event: Event): void {
    if (this.section.model?.disabled) {
      return;
    }
    this.menuService.getMenuTopSections(this.menuID).pipe(first()).subscribe((sections) => {
      sections
        .filter((section) => section.id !== this.section.id && section.active)
        .forEach((section) => this.menuService.deactivateSection(this.menuID, section.id));
      this.activateSection(event);
    });
  }

  toggleMobileCommunity(event: Event, sectionID: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.expandedMobileCommunities.has(sectionID)) {
      this.expandedMobileCommunities.delete(sectionID);
    } else {
      this.expandedMobileCommunities.add(sectionID);
    }
  }

  isMobileCommunityExpanded(sectionID: string): boolean {
    return this.expandedMobileCommunities.has(sectionID);
  }
}
