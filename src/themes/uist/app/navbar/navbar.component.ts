import {
  AsyncPipe,
  NgClass,
  NgComponentOutlet,
} from '@angular/common';
import {
  Component,
  inject,
} from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import {
  forkJoin,
  of,
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  switchMap,
  take,
} from 'rxjs/operators';

import { DSONameService } from '../../../../app/core/breadcrumbs/dso-name.service';
import { CollectionDataService } from '../../../../app/core/data/collection-data.service';
import { CommunityDataService } from '../../../../app/core/data/community-data.service';
import { Collection } from '../../../../app/core/shared/collection.model';
import { Community } from '../../../../app/core/shared/community.model';
import { getFirstCompletedRemoteData } from '../../../../app/core/shared/operators';
import { NavbarComponent as BaseComponent } from '../../../../app/navbar/navbar.component';
import { slideMobileNav } from '../../../../app/shared/animations/slide';
import { ThemedUserMenuComponent } from '../../../../app/shared/auth-nav-menu/user-menu/themed-user-menu.component';
import { MenuID } from '../../../../app/shared/menu/menu-id.model';
import { LinkMenuItemModel } from '../../../../app/shared/menu/menu-item/models/link.model';
import { TextMenuItemModel } from '../../../../app/shared/menu/menu-item/models/text.model';
import { MenuItemType } from '../../../../app/shared/menu/menu-item-type.model';
import { MenuSection } from '../../../../app/shared/menu/menu-section.model';

const COMMUNITY_LIST_MENU_TEXT = 'menu.section.browse_global_communities_and_collections';
const UIST_NAVIGATION_PAGE_SIZE = 100;

export interface UistNavigationTarget {
  id: string;
  label: string;
  link: string;
}

export interface UistNavigationGroup {
  community: UistNavigationTarget;
  collections: UistNavigationTarget[];
}

export function createUistNavigationGroup(
  community: Community,
  collections: Collection[],
  dsoNameService: DSONameService,
): UistNavigationGroup {
  return {
    community: {
      id: `community-${community.uuid}`,
      label: dsoNameService.getName(community),
      link: `/communities/${community.uuid}`,
    },
    collections: collections.map((collection) => ({
      id: `collection-${collection.uuid}`,
      label: dsoNameService.getName(collection),
      link: `/collections/${collection.uuid}`,
    })),
  };
}

@Component({
  selector: 'ds-themed-navbar',
  styleUrls: ['./navbar.component.scss'],
  templateUrl: './navbar.component.html',
  animations: [slideMobileNav],
  imports: [
    AsyncPipe,
    NgbDropdownModule,
    NgClass,
    NgComponentOutlet,
    ThemedUserMenuComponent,
    TranslateModule,
  ],
})
export class NavbarComponent extends BaseComponent {
  private readonly communityDataService = inject(CommunityDataService);
  private readonly collectionDataService = inject(CollectionDataService);
  private readonly dsoNameService = inject(DSONameService);

  override ngOnInit(): void {
    super.ngOnInit();

    // The UIST navbar-section override turns this link into a dropdown as its
    // children arrive, so the rest of the public navigation remains available
    // while these two requests complete.
    this.subs.push(this.menuService.getMenuTopSections(MenuID.PUBLIC).pipe(
      map((sections) => sections.find((section) =>
        (section.model as TextMenuItemModel).text === COMMUNITY_LIST_MENU_TEXT,
      )),
      filter((section): section is MenuSection => !!section),
      take(1),
      switchMap((parent) => {
        // Select the expandable renderer immediately, before the asynchronous
        // hierarchy arrives, so desktop hover and mobile click behavior are
        // consistent throughout loading.
        this.menuService.addSection(MenuID.PUBLIC, {
          ...parent,
          alwaysRenderExpandable: true,
        });
        return this.communityDataService.findTop({
          currentPage: 1,
          elementsPerPage: UIST_NAVIGATION_PAGE_SIZE,
        }).pipe(
          getFirstCompletedRemoteData(),
          map((result) => result.hasSucceeded ? result.payload.page : []),
          catchError(() => of([])),
          map((communities) => ({ parent, communities })),
        );
      }),
      switchMap(({ parent, communities }) => {
        const groups$ = communities.map((community) =>
          this.collectionDataService.findByParent(community.uuid, {
            currentPage: 1,
            elementsPerPage: UIST_NAVIGATION_PAGE_SIZE,
          }).pipe(
            getFirstCompletedRemoteData(),
            map((result) => result.hasSucceeded ? result.payload.page : []),
            catchError(() => of([])),
            map((collections) => createUistNavigationGroup(community, collections, this.dsoNameService)),
          ));
        return (groups$.length > 0 ? forkJoin(groups$) : of([])).pipe(
          map((groups) => ({ parent, groups })),
        );
      }),
    ).subscribe(({ parent, groups }) => {
      this.addNavigationGroups(parent.id, groups);
    }));
  }

  private addNavigationGroups(parentID: string, groups: UistNavigationGroup[]): void {
    groups.forEach((group, communityIndex) => {
      const communitySectionID = `uist-${group.community.id}`;
      this.menuService.addSection(MenuID.PUBLIC, {
        id: communitySectionID,
        parentID,
        index: communityIndex + 1,
        visible: true,
        shouldPersistOnRouteChange: true,
        model: {
          type: MenuItemType.LINK,
          text: group.community.label,
          link: group.community.link,
        } as LinkMenuItemModel,
      });

      group.collections.forEach((collection, collectionIndex) => {
        this.menuService.addSection(MenuID.PUBLIC, {
          id: `uist-${collection.id}`,
          parentID: communitySectionID,
          index: collectionIndex + 1,
          visible: true,
          shouldPersistOnRouteChange: true,
          model: {
            type: MenuItemType.LINK,
            text: collection.label,
            link: collection.link,
          } as LinkMenuItemModel,
        });
      });
    });

    this.menuService.addSection(MenuID.PUBLIC, {
      id: 'uist-all-communities-and-collections',
      parentID,
      index: groups.length + 1,
      visible: true,
      shouldPersistOnRouteChange: true,
      model: {
        type: MenuItemType.LINK,
        text: 'uist.nav.communities-and-collections.all',
        link: '/community-list',
      } as LinkMenuItemModel,
    });
  }
}
