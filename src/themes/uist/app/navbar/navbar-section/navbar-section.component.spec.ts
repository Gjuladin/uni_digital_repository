import { MenuID } from '../../../../../app/shared/menu/menu-id.model';
import { MenuItemType } from '../../../../../app/shared/menu/menu-item-type.model';
import { getComponentForMenu } from '../../../../../app/shared/menu/menu-section.decorator';
import { NavbarSectionComponent } from './navbar-section.component';

describe('UIST Communities & Collections navbar section', () => {
  it('registers the UIST renderer for initially non-expandable public links', () => {
    expect(getComponentForMenu(MenuID.PUBLIC, false, 'uist')).toBe(NavbarSectionComponent);
  });

  it('identifies the Communities & Collections menu section', () => {
    const component = Object.create(NavbarSectionComponent.prototype) as NavbarSectionComponent;
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
});
