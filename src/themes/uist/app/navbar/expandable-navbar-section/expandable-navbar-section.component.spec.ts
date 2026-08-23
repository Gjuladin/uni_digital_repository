import { of } from 'rxjs';

import { MenuItemType } from '../../../../../app/shared/menu/menu-item-type.model';
import { MenuSection } from '../../../../../app/shared/menu/menu-section.model';
import {
  ExpandableNavbarSectionComponent,
  filterUistBrowseMenuSections,
  UIST_BROWSE_DEFINITION_IDS,
} from './expandable-navbar-section.component';

describe('UIST public browse navigation', () => {
  const browseSection = (id: string): MenuSection => ({
    id,
    visible: true,
    model: {
      type: MenuItemType.LINK,
      text: `menu.section.browse_global_by_${id}`,
      link: `/browse/${id}`,
    },
  });

  it('offers only the three UIST browse definitions', () => {
    expect(UIST_BROWSE_DEFINITION_IDS).toEqual(new Set(['dateissued', 'author', 'title']));
  });

  it('removes Subject and Subject Category without affecting non-browse entries', () => {
    const nonBrowse = {
      id: 'community-list',
      visible: true,
      model: {
        type: MenuItemType.LINK,
        text: 'menu.section.browse_global_communities_and_collections',
        link: '/community-list',
      },
    } as MenuSection;

    expect(filterUistBrowseMenuSections([
      browseSection('dateissued'),
      browseSection('author'),
      browseSection('title'),
      browseSection('subject'),
      browseSection('srsc'),
      nonBrowse,
    ]).map((section) => section.id)).toEqual(['dateissued', 'author', 'title', 'community-list']);
  });

  it('recognizes the actual expandable Communities & Collections rendering path', () => {
    const component = Object.create(ExpandableNavbarSectionComponent.prototype) as ExpandableNavbarSectionComponent;
    component.section = {
      id: 'communities-and-collections',
      visible: true,
      model: {
        type: MenuItemType.LINK,
        text: 'menu.section.browse_global_communities_and_collections',
        link: '/community-list',
      },
    };

    expect(component.isCommunitiesAndCollections).toBeTrue();
  });

  it('ignores pointer clicks on desktop because hover owns the interaction', () => {
    const component = Object.create(ExpandableNavbarSectionComponent.prototype) as ExpandableNavbarSectionComponent;
    component.isMobile$ = of(false);
    const toggle = spyOn(component, 'toggleSection');
    const event = new MouseEvent('click', { detail: 1 });
    spyOn(event, 'preventDefault');

    component.onTriggerClick(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(toggle).not.toHaveBeenCalled();
  });

  it('supports Enter keyboard activation on desktop exactly once', () => {
    const component = Object.create(ExpandableNavbarSectionComponent.prototype) as ExpandableNavbarSectionComponent;
    component.isMobile$ = of(false);
    component.menuID = 'public' as any;
    component.section = browseSection('title');
    (component as any).menuService = {
      getMenuTopSections: () => of([component.section]),
      deactivateSection: jasmine.createSpy('deactivateSection'),
    };
    const toggle = spyOn(component, 'toggleSection');

    component.onTriggerKeyDown(new KeyboardEvent('keydown', { code: 'Enter' }));

    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('closes an active sibling before ArrowDown opens the current section', () => {
    const component = Object.create(ExpandableNavbarSectionComponent.prototype) as ExpandableNavbarSectionComponent;
    component.menuID = 'public' as any;
    component.section = browseSection('title');
    const activeSibling = { ...browseSection('author'), active: true };
    const deactivateSection = jasmine.createSpy('deactivateSection');
    (component as any).menuService = {
      getMenuTopSections: () => of([activeSibling, component.section]),
      deactivateSection,
    };
    const activate = spyOn(component, 'activateSection');
    const event = new KeyboardEvent('keydown', { code: 'ArrowDown' });

    component.onTriggerKeyDown(event);

    expect(deactivateSection).toHaveBeenCalledWith(component.menuID, activeSibling.id);
    expect(activate).toHaveBeenCalledWith(event);
  });

  it('does not close an active sibling when the current section is disabled', () => {
    const component = Object.create(ExpandableNavbarSectionComponent.prototype) as ExpandableNavbarSectionComponent;
    component.isMobile$ = of(true);
    component.menuID = 'public' as any;
    component.section = {
      ...browseSection('title'),
      model: { ...browseSection('title').model, disabled: true },
    };
    const deactivateSection = jasmine.createSpy('deactivateSection');
    (component as any).menuService = {
      getMenuTopSections: () => of([{ ...browseSection('author'), active: true }, component.section]),
      deactivateSection,
    };
    const toggle = spyOn(component, 'toggleSection');

    component.onTriggerClick(new MouseEvent('click', { detail: 1 }));

    expect(deactivateSection).not.toHaveBeenCalled();
    expect(toggle).not.toHaveBeenCalled();
  });

  it('toggles the dropdown when its trigger is clicked on mobile', () => {
    const component = Object.create(ExpandableNavbarSectionComponent.prototype) as ExpandableNavbarSectionComponent;
    component.isMobile$ = of(true);
    component.menuID = 'public' as any;
    component.section = browseSection('title');
    (component as any).menuService = {
      getMenuTopSections: () => of([component.section]),
      deactivateSection: jasmine.createSpy('deactivateSection'),
    };
    const toggle = spyOn(component, 'toggleSection');
    const event = new MouseEvent('click');

    component.onTriggerClick(event);

    expect(toggle).toHaveBeenCalledWith(event);
  });

  it('closes another active top-level dropdown before opening on mobile', () => {
    const component = Object.create(ExpandableNavbarSectionComponent.prototype) as ExpandableNavbarSectionComponent;
    component.isMobile$ = of(true);
    component.menuID = 'public' as any;
    component.section = browseSection('title');
    const activeSibling = { ...browseSection('author'), active: true };
    const deactivateSection = jasmine.createSpy('deactivateSection');
    (component as any).menuService = {
      getMenuTopSections: () => of([activeSibling, component.section]),
      deactivateSection,
    };
    spyOn(component, 'toggleSection');

    component.onTriggerClick(new MouseEvent('click'));

    expect(deactivateSection).toHaveBeenCalledWith(component.menuID, activeSibling.id);
  });

  it('expands and collapses a community independently on mobile', () => {
    const component = Object.create(ExpandableNavbarSectionComponent.prototype) as ExpandableNavbarSectionComponent;
    (component as any).expandedMobileCommunities = new Set<string>();
    const event = new MouseEvent('click');

    component.toggleMobileCommunity(event, 'community-a');
    expect(component.isMobileCommunityExpanded('community-a')).toBeTrue();

    component.toggleMobileCommunity(event, 'community-a');
    expect(component.isMobileCommunityExpanded('community-a')).toBeFalse();
  });
});
