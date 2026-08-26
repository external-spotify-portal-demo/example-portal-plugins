import express from 'express';
import Router from 'express-promise-router';
import { InputError, NotFoundError } from '@backstage/errors';
import type { DatabaseHandler } from './DatabaseHandler';

export function createRouter(options: {
  database: DatabaseHandler;
}): express.Router {
  const { database } = options;
  const router = Router();
  router.use(express.json());

  router.get('/stats', async (_req, res) => {
    const stats = await database.getAll();
    res.json(stats);
  });

  router.get('/stats/:teamRef', async (req, res) => {
    const teamRef = decodeURIComponent(req.params.teamRef);
    const stats = await database.getByTeamRef(teamRef);
    if (!stats) {
      throw new NotFoundError(`No stats found for team: ${teamRef}`);
    }
    res.json(stats);
  });

  router.put('/stats/:teamRef', async (req, res) => {
    const teamRef = decodeURIComponent(req.params.teamRef);
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
