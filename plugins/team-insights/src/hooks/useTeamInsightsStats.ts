import { useApi } from '@backstage/frontend-plugin-api';
import { useAsync } from 'react-use';
import { teamInsightsApiRef } from '../api';

export type { TeamInsightsStats } from '../api';

export function useTeamInsightsStats(teamRef: string) {
  const api = useApi(teamInsightsApiRef);
  const { value: stats, loading, error } = useAsync(
    () => api.getStatsByTeamRef(teamRef),
    [api, teamRef],
  );
  return { stats, loading, error };
}
