import express from 'express';
import Router from 'express-promise-router';
import { InputError } from '@backstage/errors';
import type { DatabaseHandler } from './DatabaseHandler';
import type { TeamInsightsStats } from '../types';

export function createRouter(options: {
  database: DatabaseHandler;
}): express.Router {
  const { database } = options;
  const router = Router();
  router.use(express.json());

  router.get('/stats', async (req, res) => {
    const teamRef = req.query.teamRef as string | undefined;
    if (teamRef) {
      let stats = await database.getByTeamRef(teamRef);
      if (!stats) {
        stats = generateStats(teamRef);
        await database.upsert(stats);
      }
      return res.json(stats);
    }
    const stats = await database.getAll();
    return res.json(stats);
  });

  router.put('/stats', async (req, res) => {
    const teamRef = req.query.teamRef as string | undefined;
    if (!teamRef) {
      throw new InputError('Missing required query parameter: teamRef');
    }

    const body = req.body;
    if (
      !body.ownership?.byKind ||
      typeof body.ownership.total !== 'number' ||
      !body.maturity ||
      !body.docs ||
      !body.completeness
    ) {
      throw new InputError('Invalid request body: missing required fields');
    }

    const stats = { teamRef, ...body };
    await database.upsert(stats);
    res.json(stats);
  });

  return router;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function generateStats(teamRef: string): TeamInsightsStats {
  const h = hashCode(teamRef);

  const total = 4 + (h % 16);
  const components = Math.max(1, Math.floor(total * 0.5) + (h % 3));
  const apis = Math.max(0, Math.floor(total * 0.2) - (h % 2));
  const resources = Math.max(0, Math.floor(total * 0.15));
  const systems = Math.max(1, total - components - apis - resources);

  const productionRatio = 0.4 + ((h >> 4) % 6) * 0.1;
  const production = Math.min(total, Math.max(1, Math.round(total * productionRatio)));
  const remaining = total - production;
  const experimental = Math.round(remaining * 0.7);
  const deprecated = remaining - experimental;

  const docsRatio = 0.3 + ((h >> 8) % 7) * 0.1;
  const covered = Math.min(total, Math.max(0, Math.round(total * docsRatio)));
  const missing = total - covered;
  const teamName = teamRef.split('/').pop() ?? 'unknown';
  const missingRefs = Array.from({ length: missing }, (_, i) =>
    `component:default/${teamName}-svc-${i + 1}`,
  );

  const descRatio = 0.5 + ((h >> 12) % 5) * 0.1;
  const tagsRatio = 0.3 + ((h >> 16) % 6) * 0.1;
  const lifecycleRatio = 0.6 + ((h >> 20) % 4) * 0.1;

  return {
    teamRef,
    ownership: {
      total,
      byKind: { component: components, api: apis, resource: resources, system: systems },
    },
    maturity: { production, experimental, deprecated },
    docs: { covered, total, missingRefs },
    completeness: {
      withDescription: Math.min(total, Math.round(total * descRatio)),
      withTags: Math.min(total, Math.round(total * tagsRatio)),
      withLifecycle: Math.min(total, Math.round(total * lifecycleRatio)),
      total,
    },
  };
}
