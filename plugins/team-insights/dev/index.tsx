import '@backstage/cli/asset-types';
import { createApp } from '@backstage/frontend-defaults';
import ReactDOM from 'react-dom/client';
import '@backstage/ui/css/styles.css';
import teamInsightsPlugin from '../src';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import orgPlugin from '@backstage/plugin-org/alpha';
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';
import { teamInsightsApiRef } from '../src/api';
import type { TeamInsightsApi, TeamInsightsStats } from '../src/api';

const teams: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: { name: 'platform-team' },
    spec: { type: 'team' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: { name: 'frontend-team' },
    spec: { type: 'team' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: { name: 'data-team' },
    spec: { type: 'team' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: { name: 'infra-team' },
    spec: { type: 'team' },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: { name: 'mobile-team' },
    spec: { type: 'team' },
  },
];

const mockStats: TeamInsightsStats[] = [
  {
    teamRef: 'group:default/platform-team',
    ownership: { total: 12, byKind: { component: 7, api: 3, resource: 1, system: 1 } },
    maturity: { production: 10, experimental: 1, deprecated: 1 },
    docs: { covered: 10, total: 12, missingRefs: ['component:default/legacy-auth-proxy', 'resource:default/config-bucket'] },
    completeness: { withDescription: 11, withTags: 9, withLifecycle: 12, total: 12 },
  },
  {
    teamRef: 'group:default/frontend-team',
    ownership: { total: 8, byKind: { component: 5, api: 2, resource: 0, system: 1 } },
    maturity: { production: 5, experimental: 3, deprecated: 0 },
    docs: { covered: 5, total: 8, missingRefs: ['component:default/design-system-v2', 'component:default/storybook-preview', 'api:default/bff-graphql'] },
    completeness: { withDescription: 7, withTags: 5, withLifecycle: 8, total: 8 },
  },
  {
    teamRef: 'group:default/data-team',
    ownership: { total: 15, byKind: { component: 8, api: 2, resource: 4, system: 1 } },
    maturity: { production: 6, experimental: 7, deprecated: 2 },
    docs: { covered: 4, total: 15, missingRefs: ['component:default/spark-etl-jobs', 'component:default/feature-store', 'component:default/ml-training-pipeline'] },
    completeness: { withDescription: 8, withTags: 5, withLifecycle: 9, total: 15 },
  },
  {
    teamRef: 'group:default/infra-team',
    ownership: { total: 6, byKind: { component: 3, api: 1, resource: 1, system: 1 } },
    maturity: { production: 6, experimental: 0, deprecated: 0 },
    docs: { covered: 6, total: 6, missingRefs: [] },
    completeness: { withDescription: 6, withTags: 6, withLifecycle: 6, total: 6 },
  },
  {
    teamRef: 'group:default/mobile-team',
    ownership: { total: 10, byKind: { component: 6, api: 2, resource: 1, system: 1 } },
    maturity: { production: 7, experimental: 2, deprecated: 1 },
    docs: { covered: 6, total: 10, missingRefs: ['component:default/ios-analytics-sdk', 'component:default/android-crashlytics'] },
    completeness: { withDescription: 8, withTags: 6, withLifecycle: 10, total: 10 },
  },
];

const mockTeamInsightsApi: TeamInsightsApi = {
  async getStats() {
    return mockStats;
  },
  async getStatsByTeamRef(ref: string) {
    const found = mockStats.find(s => s.teamRef === ref);
    if (!found) throw new Error(`No stats for ${ref}`);
    return found;
  },
};

const catalogApi = catalogApiMock({ entities: teams });

const catalogPluginOverrides = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApi,
        }),
    }),
  ],
});

const teamInsightsOverrides = createFrontendModule({
  pluginId: 'team-insights',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: teamInsightsApiRef,
          deps: {},
          factory: () => mockTeamInsightsApi,
        }),
    }),
  ],
});

const app = createApp({
  features: [
    catalogPlugin,
    catalogPluginOverrides,
    teamInsightsPlugin,
    teamInsightsOverrides,
    orgPlugin,
  ],
});
ReactDOM.createRoot(document.getElementById('root')!).render(app.createRoot());
