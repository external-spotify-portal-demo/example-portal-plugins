import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { readOptionalFilterPredicateFromConfig } from '@backstage/filter-predicates';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import {
  EntityTransformerProcessor,
  TransformerRule,
} from './EntityTransformerProcessor';

export const catalogModuleEntityTransformerProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'entity-transformer-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, config, catalog }) {
        const legacyRules = config.getOptionalConfigArray(
          'catalog.entityEnricher.rules',
        );
        if (legacyRules) {
          logger.warn(
            'catalog.entityEnricher is deprecated, use catalog.entityTransformer instead',
          );
        }

        const rules: TransformerRule[] = [
          ...(legacyRules ?? []),
          ...(config.getOptionalConfigArray(
            'catalog.entityTransformer.rules',
          ) ?? []),
        ].map(c => {
          const filter =
            c.getOptionalString('filter') ??
            readOptionalFilterPredicateFromConfig(c, { key: 'filter' });

          return {
            path: c.getString('path'),
            key: c.getOptionalString('key'),
            value: c.getString('value'),
            filter,
          };
        });

        for (const rule of rules) {
          logger.info(
            `entity-transformer rule: path="${rule.path}" key="${
              rule.key ?? ''
            }" value="${rule.value}"`,
          );
        }

        catalog.addProcessor(new EntityTransformerProcessor(rules, { logger }));
        logger.info(
          `entity-transformer-processor registered with ${rules.length} rule(s)`,
        );
      },
    });
  },
});
