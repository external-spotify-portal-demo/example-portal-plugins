import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { TechDocsAutoAnnotatorProcessor } from './TechDocsAutoAnnotatorProcessor';

const DEFAULT_KINDS = ['Component'];

export const catalogModuleTechdocsAutoAnnotator = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'techdocs-auto-annotator',
  register(reg) {
    reg.registerInit({
      deps: {
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ logger, config, catalog }) {
        const configured = config.getOptionalStringArray(
          'catalog.techdocsAutoAnnotator.kinds',
        );
        const kinds = configured?.length ? configured : DEFAULT_KINDS;

        catalog.addProcessor(new TechDocsAutoAnnotatorProcessor(kinds));
        logger.info(
          `techdocs-auto-annotator registered for kinds: ${kinds.join(', ')}`,
        );
      },
    });
  },
});
