import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { readOptionalFilterPredicateFromConfig } from '@backstage/filter-predicates';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import {
  EntityEnricherProcessor,
  EnricherRule,
  parseFilterString,
} from './EntityEnricherProcessor';

export const catalogModuleEntityEnricherProcessor = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'entity-enricher-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, config, catalog }) {
        const rules: EnricherRule[] =
          config
            .getOptionalConfigArray('catalog.entityEnricher.rules')
            ?.map(c => {
              const filterString = c.getOptionalString('filter');
              const filter = filterString
                ? parseFilterString(filterString)
                : readOptionalFilterPredicateFromConfig(c, { key: 'filter' });

              return {
                path: c.getString('path'),
                key: c.getOptionalString('key'),
                value: c.getString('value'),
                filter,
              };
            }) ?? [];

        for (const rule of rules) {
          logger.info(
            `entity-enricher rule: path="${rule.path}" key="${rule.key ?? ''}" value="${rule.value}"`,
          );
        }

        catalog.addProcessor(new EntityEnricherProcessor(rules));
        logger.info(
          `entity-enricher-processor registered with ${rules.length} rule(s)`,
        );
      },
    });
  },
});
