import { createApiRef } from '@backstage/frontend-plugin-api';
import type { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';
import { ResponseError } from '@backstage/errors';

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

export interface TeamInsightsApi {
  getStats(): Promise<TeamInsightsStats[]>;
  getStatsByTeamRef(teamRef: string): Promise<TeamInsightsStats>;
}

export const teamInsightsApiRef = createApiRef<TeamInsightsApi>().with({
  id: 'plugin.team-insights.api',
  pluginId: 'team-insights',
});

export class TeamInsightsClient implements TeamInsightsApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getStats(): Promise<TeamInsightsStats[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl('team-insights');
    const response = await this.fetchApi.fetch(`${baseUrl}/stats`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }

  async getStatsByTeamRef(teamRef: string): Promise<TeamInsightsStats> {
    const baseUrl = await this.discoveryApi.getBaseUrl('team-insights');
    const encoded = encodeURIComponent(teamRef);
    const response = await this.fetchApi.fetch(`${baseUrl}/stats/${encoded}`);
    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }
    return response.json();
  }
}
