import {
  coreServices,
  createBackendPlugin,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { catalogServiceRef } from '@backstage/plugin-catalog-node';
import { DatabaseHandler } from './service/DatabaseHandler';
import { createRouter } from './service/router';

const migrationsDir = resolvePackagePath(
  '@internal/backstage-plugin-team-insights-backend',
  'migrations',
);

export const teamInsightsBackendPlugin = createBackendPlugin({
  pluginId: 'team-insights',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        database: coreServices.database,
        httpRouter: coreServices.httpRouter,
        catalog: catalogServiceRef,
        httpAuth: coreServices.httpAuth,
      },
      async init({ logger, database, httpRouter, catalog, httpAuth }) {
        const knex = await database.getClient();
        await knex.migrate.latest({ directory: migrationsDir });

        const handler = new DatabaseHandler(knex);
        const router = createRouter({ database: handler, catalog, httpAuth });

        httpRouter.use(router);

        logger.info('team-insights backend started');
      },
    });
  },
});
