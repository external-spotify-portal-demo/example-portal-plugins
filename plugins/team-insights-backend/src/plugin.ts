import {
  coreServices,
  createBackendPlugin,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { DatabaseHandler } from './service/DatabaseHandler';
import { createRouter } from './service/router';
import { seedDatabase } from './seed';

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
        lifecycle: coreServices.lifecycle,
      },
      async init({ logger, database, httpRouter, lifecycle }) {
        const knex = await database.getClient();
        await knex.migrate.latest({ directory: migrationsDir });

        const handler = new DatabaseHandler(knex);

        lifecycle.addStartupHook(async () => {
          await seedDatabase(handler, logger);
        });

        const router = createRouter({ database: handler });

        httpRouter.use(router);
        httpRouter.addAuthPolicy({
          path: '/stats',
          allow: 'unauthenticated',
        });
        httpRouter.addAuthPolicy({
          path: '/stats/*',
          allow: 'unauthenticated',
        });

        logger.info('team-insights backend started');
      },
    });
  },
});
