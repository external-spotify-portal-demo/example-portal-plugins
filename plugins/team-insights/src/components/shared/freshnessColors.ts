export const FRESHNESS_COLORS = {
  '0-30': '#4caf50',
  '31-90': '#ff9800',
  '90+': '#f44336',
} as const;

export const getAgeColor = (daysOld: number): string => {
  if (daysOld > 90) return '#f44336';
  if (daysOld > 30) return '#ff9800';
  return '#4caf50';
};
