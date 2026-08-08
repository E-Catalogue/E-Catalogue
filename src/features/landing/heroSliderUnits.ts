export const resolveHeroSliderUnits = <T extends { id: string }>(
  homepageUnits?: T[] | null,
  catalogUnits?: T[] | null,
  featuredUnits?: T[] | null,
): T[] => {
  if (homepageUnits?.length || catalogUnits?.length) {
    const merged = [...(homepageUnits ?? []), ...(catalogUnits ?? [])];
    return [...new Map(merged.map((unit) => [unit.id, unit])).values()];
  }
  return featuredUnits ?? [];
};
