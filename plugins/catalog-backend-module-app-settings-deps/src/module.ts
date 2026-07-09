import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { AppSettingsDepsProcessor } from './AppSettingsDepsProcessor';

export default createBackendModule({
  pluginId: 'catalog',
  moduleId: 'app-settings-deps',
  register(env) {
    env.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        urlReader: coreServices.urlReader,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ catalog, urlReader, config, logger }) {
        catalog.addProcessor(
          new AppSettingsDepsProcessor(urlReader, config, logger),
        );
      },
    });
  },
});
