// plugins/team-insights/src/hooks/useTeamInsightsStats.ts

export type TeamInsightsStats = {
  withDocs: number;
  totalOwned: number;
  ages: {
    '0-30': number;
    '31-90': number;
    '90+': number;
  };
  withoutDocsRefs: string[];
  stalest: { ref: string; daysOld: number }[];
};

// TODO: replace with real data fetching
export function useTeamInsightsStats(): TeamInsightsStats {
  return {
    withDocs: 3,
    totalOwned: 10,
    ages: {
      '0-30': 2,
      '31-90': 1,
      '90+': 0,
    },
    withoutDocsRefs: [],
    stalest: [],
  };
}
