import type { TeamInsightsStats } from './types';
import type { DatabaseHandler } from './service/DatabaseHandler';
import type { LoggerService } from '@backstage/backend-plugin-api';

const seedStats: TeamInsightsStats[] = [
  {
    teamRef: 'group:default/platform-team',
    ownership: {
      total: 12,
      byKind: { component: 7, api: 3, resource: 1, system: 1 },
    },
    maturity: { production: 10, experimental: 1, deprecated: 1 },
    docs: {
      covered: 10,
      total: 12,
      missingRefs: [
        'component:default/legacy-auth-proxy',
        'resource:default/config-bucket',
      ],
    },
    completeness: {
      withDescription: 11,
      withTags: 9,
      withLifecycle: 12,
      total: 12,
    },
  },
  {
    teamRef: 'group:default/frontend-team',
    ownership: {
      total: 8,
      byKind: { component: 5, api: 2, resource: 0, system: 1 },
    },
    maturity: { production: 5, experimental: 3, deprecated: 0 },
    docs: {
      covered: 5,
      total: 8,
      missingRefs: [
        'component:default/design-system-v2',
        'component:default/storybook-preview',
        'api:default/bff-graphql',
      ],
    },
    completeness: {
      withDescription: 7,
      withTags: 5,
      withLifecycle: 8,
      total: 8,
    },
  },
  {
    teamRef: 'group:default/data-team',
    ownership: {
      total: 15,
      byKind: { component: 8, api: 2, resource: 4, system: 1 },
    },
    maturity: { production: 6, experimental: 7, deprecated: 2 },
    docs: {
      covered: 4,
      total: 15,
      missingRefs: [
        'component:default/spark-etl-jobs',
        'component:default/feature-store',
        'component:default/ml-training-pipeline',
        'component:default/data-quality-checks',
        'resource:default/raw-events-bucket',
        'resource:default/model-artifacts',
        'resource:default/training-datasets',
        'api:default/prediction-api',
        'component:default/ab-test-framework',
        'component:default/metrics-collector',
        'component:default/dag-scheduler',
      ],
    },
    completeness: {
      withDescription: 8,
      withTags: 5,
      withLifecycle: 9,
      total: 15,
    },
  },
  {
    teamRef: 'group:default/infra-team',
    ownership: {
      total: 6,
      byKind: { component: 3, api: 1, resource: 1, system: 1 },
    },
    maturity: { production: 6, experimental: 0, deprecated: 0 },
    docs: {
      covered: 6,
      total: 6,
      missingRefs: [],
    },
    completeness: {
      withDescription: 6,
      withTags: 6,
      withLifecycle: 6,
      total: 6,
    },
  },
  {
    teamRef: 'group:default/mobile-team',
    ownership: {
      total: 10,
      byKind: { component: 6, api: 2, resource: 1, system: 1 },
    },
    maturity: { production: 7, experimental: 2, deprecated: 1 },
    docs: {
      covered: 6,
      total: 10,
      missingRefs: [
        'component:default/ios-analytics-sdk',
        'component:default/android-crashlytics',
        'component:default/push-notification-worker',
        'resource:default/app-signing-keys',
      ],
    },
    completeness: {
      withDescription: 8,
      withTags: 6,
      withLifecycle: 10,
      total: 10,
    },
  },
];

export async function seedDatabase(
  handler: DatabaseHandler,
  logger: LoggerService,
): Promise<void> {
  const count = await handler.getCount();
  if (count > 0) {
    logger.info(`Skipping seed: ${count} teams already in database`);
    return;
  }

  for (const stats of seedStats) {
    await handler.upsert(stats);
  }
  logger.info(`Seeded ${seedStats.length} teams with example data`);
}
