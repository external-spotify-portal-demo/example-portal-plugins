import { createBackendModule } from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { KubernetesSelectorProcessor } from './KubernetesSelectorProcessor';

export const catalogModuleKubernetesSelector = createBackendModule({
  pluginId: 'catalog',
  moduleId: 'kubernetes-selector',
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
      },
      async init({ catalog }) {
        catalog.addProcessor(new KubernetesSelectorProcessor());
      },
    });
  },
});
