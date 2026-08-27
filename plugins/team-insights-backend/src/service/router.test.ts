import { TestDatabases } from '@backstage/backend-test-utils';
import { resolvePackagePath } from '@backstage/backend-plugin-api';
import request from 'supertest';
import express from 'express';
import { createRouter } from './router';
import { DatabaseHandler } from './DatabaseHandler';

const migrationsDir = resolvePackagePath(
  '@internal/backstage-plugin-team-insights-backend',
  'migrations',
);

const sampleBody = {
  ownership: {
    total: 10,
    byKind: { component: 6, api: 2, resource: 1, system: 1 },
  },
  maturity: { production: 7, experimental: 2, deprecated: 1 },
  docs: {
    covered: 8,
    total: 10,
    missingRefs: ['component:default/svc-a'],
  },
  completeness: {
    withDescription: 9,
    withTags: 7,
    withLifecycle: 10,
    total: 10,
  },
};

describe('router', () => {
  const databases = TestDatabases.create();
  let app: express.Express;

  beforeAll(async () => {
    const knex = await databases.init('SQLITE_3');
    await knex.migrate.latest({ directory: migrationsDir });
    const handler = new DatabaseHandler(knex);
    const router = createRouter({ database: handler });
    app = express();
    app.use(router);
    app.use(
      (
        err: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction,
      ) => {
        res
          .status(err.statusCode ?? 500)
          .json({ error: { message: err.message } });
      },
    );
  });

  it('GET /stats returns empty array initially', async () => {
    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /stats?teamRef= returns default empty stats for unknown team', async () => {
    const res = await request(app)
      .get('/stats')
      .query({ teamRef: 'group:default/unknown' });
    expect(res.status).toBe(200);
    expect(res.body.teamRef).toBe('group:default/unknown');
    expect(res.body.ownership.total).toBe(0);
    expect(res.body.docs.missingRefs).toEqual([]);
  });

  it('PUT /stats?teamRef= upserts and returns stats', async () => {
    const res = await request(app)
      .put('/stats')
      .query({ teamRef: 'group:default/test-team' })
      .send(sampleBody);

    expect(res.status).toBe(200);
    expect(res.body.teamRef).toBe('group:default/test-team');
    expect(res.body.ownership.total).toBe(10);
  });

  it('GET /stats?teamRef= returns upserted stats', async () => {
    const res = await request(app)
      .get('/stats')
      .query({ teamRef: 'group:default/test-team' });
    expect(res.status).toBe(200);
    expect(res.body.teamRef).toBe('group:default/test-team');
    expect(res.body.docs.missingRefs).toEqual(['component:default/svc-a']);
  });

  it('GET /stats returns all teams', async () => {
    await request(app)
      .put('/stats')
      .query({ teamRef: 'group:default/other-team' })
      .send(sampleBody);

    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('PUT /stats without teamRef returns 400', async () => {
    const res = await request(app)
      .put('/stats')
      .send(sampleBody);
    expect(res.status).toBe(400);
  });

  it('PUT /stats?teamRef= rejects invalid body', async () => {
    const res = await request(app)
      .put('/stats')
      .query({ teamRef: 'group:default/test-team' })
      .send({ bad: 'data' });
    expect(res.status).toBe(400);
  });
});
