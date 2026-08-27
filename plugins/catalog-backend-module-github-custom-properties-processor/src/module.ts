import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { ScmIntegrations } from '@backstage/integration';
import {
  GithubCustomPropertiesProcessor,
  PropertyMapping,
} from './GithubCustomPropertiesProcessor';

export const catalogModuleGithubCustomPropertiesProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'github-custom-properties-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, config, catalog }) {
        const integrations = ScmIntegrations.fromConfig(config);
        const mappings: PropertyMapping[] =
          config
            .getOptionalConfigArray('catalog.githubCustomProperties')
            ?.map(c => ({
              property: c.getString('property'),
              entityPath: c.getString('entityPath'),
              prefix: c.getOptionalString('prefix'),
            })) ?? [];

        catalog.addProcessor(
          new GithubCustomPropertiesProcessor(integrations, logger, mappings),
        );
        logger.info(
          `github-custom-properties-processor registered with ${mappings.length} mapping(s)`,
        );
      },
    });
  },
});
