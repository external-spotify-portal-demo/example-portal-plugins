import {
  useApi,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/frontend-plugin-api';
import { ResponseError } from '@backstage/errors';
import { useAsync } from 'react-use';

export function useTeamInsightsStats(teamRef: string) {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const {
    value: stats,
    loading,
    error,
  } = useAsync(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('team-insights');
    const params = new URLSearchParams({ teamRef });
    const response = await fetchApi.fetch(`${baseUrl}/stats?${params}`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return (await response.json()) as TeamInsightsStats;
  }, [discoveryApi, fetchApi, teamRef]);

  return { stats, loading, error };
}

export function useAllTeamInsightsStats() {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);

  const {
    value: stats,
    loading,
    error,
  } = useAsync(async () => {
    const baseUrl = await discoveryApi.getBaseUrl('team-insights');
    const response = await fetchApi.fetch(`${baseUrl}/stats`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return (await response.json()) as TeamInsightsStats[];
  }, [discoveryApi, fetchApi]);

  return { stats, loading, error };
}

export type TeamInsightsStats = {
  teamRef: string;
  ownership: {
    total: number;
    byKind: {
      component: number;
      api: number;
      resource: number;
      system: number;
    };
  };
  maturity: {
    production: number;
    experimental: number;
    deprecated: number;
  };
  docs: {
    covered: number;
    total: number;
    missingRefs: string[];
  };
  completeness: {
    withDescription: number;
    withTags: number;
    withLifecycle: number;
    total: number;
  };
};
