import { useMemo } from 'react';

import { useLessonsStore } from '../../context/LessonsContext';

import { buildCatalogItems, CatalogItem } from './catalogItems';

/** Store-fed catalog (spec #7): lessons from LessonsContext + static
 *  workouts, projected into unified CatalogItems. */
export const useCatalog = (): CatalogItem[] => {
  const { lessons } = useLessonsStore();
  return useMemo(() => buildCatalogItems(lessons), [lessons]);
};
