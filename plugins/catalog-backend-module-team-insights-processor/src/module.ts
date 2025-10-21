import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node/alpha';
import { TeamInsightsProcessor } from './TeamInsightsProcessor';

export const catalogModuleTeamInsightsProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'team-insights-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, catalog }) {
        catalog.addProcessor(new TeamInsightsProcessor());
        logger.info('team-insights-processor registered successfully');
      },
    });
  },
});
