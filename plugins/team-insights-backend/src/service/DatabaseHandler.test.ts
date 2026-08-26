import { TestDatabases } from '@backstage/backend-test-utils';
import { DatabaseHandler } from './DatabaseHandler';
import type { TeamInsightsStats } from '../types';
import { resolvePackagePath } from '@backstage/backend-plugin-api';

const migrationsDir = resolvePackagePath(
  '@internal/backstage-plugin-team-insights-backend',
  'migrations',
);

const sampleStats: TeamInsightsStats = {
  teamRef: 'group:default/test-team',
  ownership: {
    total: 10,
    byKind: { component: 6, api: 2, resource: 1, system: 1 },
  },
  maturity: { production: 7, experimental: 2, deprecated: 1 },
  docs: {
    covered: 8,
    total: 10,
    missingRefs: ['component:default/svc-a', 'component:default/svc-b'],
  },
  completeness: {
    withDescription: 9,
    withTags: 7,
    withLifecycle: 10,
    total: 10,
  },
};

describe('DatabaseHandler', () => {
  const databases = TestDatabases.create();

  async function createHandler() {
    const knex = await databases.init('SQLITE_3');
    await knex.migrate.latest({ directory: migrationsDir });
    return { handler: new DatabaseHandler(knex), knex };
  }

  it('returns empty array when no stats exist', async () => {
    const { handler } = await createHandler();
    const result = await handler.getAll();
    expect(result).toEqual([]);
  });

  it('returns undefined for unknown team ref', async () => {
    const { handler } = await createHandler();
    const result = await handler.getByTeamRef('group:default/unknown');
    expect(result).toBeUndefined();
  });

  it('upserts and retrieves stats for a team', async () => {
    const { handler } = await createHandler();
    await handler.upsert(sampleStats);

    const result = await handler.getByTeamRef('group:default/test-team');
    expect(result).toEqual(sampleStats);
  });

  it('lists all teams after multiple upserts', async () => {
    const { handler } = await createHandler();
    await handler.upsert(sampleStats);
    await handler.upsert({
      ...sampleStats,
      teamRef: 'group:default/other-team',
    });

    const result = await handler.getAll();
    expect(result).toHaveLength(2);
    expect(result.map(s => s.teamRef).sort()).toEqual([
      'group:default/other-team',
      'group:default/test-team',
    ]);
  });

  it('overwrites existing stats on upsert', async () => {
    const { handler } = await createHandler();
    await handler.upsert(sampleStats);
    await handler.upsert({ ...sampleStats, docs: { covered: 10, total: 10, missingRefs: [] } });

    const result = await handler.getByTeamRef('group:default/test-team');
    expect(result?.docs.covered).toBe(10);
    expect(result?.docs.missingRefs).toEqual([]);
  });

  it('returns correct count via getCount', async () => {
    const { handler } = await createHandler();
    expect(await handler.getCount()).toBe(0);
    await handler.upsert(sampleStats);
    expect(await handler.getCount()).toBe(1);
  });
});
