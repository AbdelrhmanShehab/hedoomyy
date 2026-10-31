export const homeSections = [
  { id: 'banner', label: 'Main banner' },
  { id: 'hero', label: 'Welcome / Shop all' },
  { id: 'categories', label: 'Categories' },
  { id: 'wholeLook', label: 'Style a whole look' },
  { id: 'newArrivals', label: 'New arrivals' },
  { id: 'bestSellers', label: 'Best sellers' },
  { id: 'feedback', label: 'Customer feedback' },
  { id: 'instagram', label: 'Instagram feed' },
];
export function sectionVisibility(settings) {
  return Object.fromEntries(homeSections.map(({ id }) => [id, settings?.[id] !== false]));
}
