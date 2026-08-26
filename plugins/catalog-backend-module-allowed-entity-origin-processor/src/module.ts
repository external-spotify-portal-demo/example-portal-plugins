import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import {
  AllowedEntityOriginProcessor,
  AllowedEntityOriginRule,
} from './AllowedEntityOriginProcessor';

export const catalogModuleAllowedEntityOriginProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'allowed-entity-origin-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, config, catalog }) {
        const rules: AllowedEntityOriginRule[] = config
          .getOptionalConfigArray('catalog.allowedEntityOrigin.rules')
          ?.map(ruleConfig => ({
            kind: ruleConfig.getString('kind'),
            type: ruleConfig.getOptionalString('type'),
            allowedLocationPatterns:
              ruleConfig.getStringArray('allowedLocationPatterns'),
          })) ?? [];

        catalog.addProcessor(new AllowedEntityOriginProcessor(rules));
        logger.info(
          `AllowedEntityOriginProcessor registered with ${rules.length} rule(s)`,
        );
      },
    });
  },
});
