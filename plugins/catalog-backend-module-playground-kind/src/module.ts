import { createBackendModule } from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { PlaygroundEntityProcessor } from './processors/PlaygroundEntityProcessor';

export const catalogModuleCustomKind = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'playground-entity-processor',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ catalog }) {
        catalog.addProcessor(new PlaygroundEntityProcessor());
      },
    });
  },
});
