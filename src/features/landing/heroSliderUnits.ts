export const resolveHeroSliderUnits = <T>(
  homepageUnits?: T[] | null,
  catalogUnits?: T[] | null,
  featuredUnits?: T[] | null,
): T[] => {
  if (homepageUnits?.length) return homepageUnits;
  if (catalogUnits?.length) return catalogUnits;
  return featuredUnits ?? [];
};
