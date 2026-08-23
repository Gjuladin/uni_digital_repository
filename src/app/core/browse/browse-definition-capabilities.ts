import { BrowseDefinition } from '../shared/browse-definition.model';

/** UIST browse definitions whose text box is always a substring search. */
export const UIST_CONTAINS_BROWSE_IDS = new Set(['author', 'title']);

/**
 * Whether this browse definition uses UIST's substring-search interaction.
 * Author and Title are an explicit UIST product contract carried forward from
 * 9.2; they never fall back to a starts-with form while the backend is being
 * initialized. Other definitions may opt in through the REST capability.
 */
export function supportsBrowseContains(browseDefinition: BrowseDefinition | undefined): boolean {
  return UIST_CONTAINS_BROWSE_IDS.has(browseDefinition?.id) || browseDefinition?.supportsContains === true;
}
