import { Collection } from '../../../../app/core/shared/collection.model';
import { Community } from '../../../../app/core/shared/community.model';
import { createUistNavigationGroup } from './navbar.component';

describe('UIST Communities & Collections navbar menu', () => {
  const dsoNameService = {
    getName: (dso: Community|Collection) => dso.name,
  } as any;

  it('nests collection links beneath their parent community', () => {
    const group = createUistNavigationGroup(
      { uuid: 'community-id', name: 'Faculty of Engineering' } as Community,
      [
      { uuid: 'collection-id', name: 'Research Articles' } as Collection,
      ],
      dsoNameService,
    );

    expect(group).toEqual({
      community: {
        id: 'community-community-id',
        label: 'Faculty of Engineering',
        link: '/communities/community-id',
      },
      collections: [{
        id: 'collection-collection-id',
        label: 'Research Articles',
        link: '/collections/collection-id',
      }],
    });
  });
});
