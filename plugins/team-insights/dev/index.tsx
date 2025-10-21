import '@backstage/cli/asset-types';
import { createApp } from '@backstage/frontend-defaults';
import ReactDOM from 'react-dom/client';
import '@backstage/ui/css/styles.css';
import teamInsightsPlugin from '../src';
import { catalogApiMock } from '@backstage/plugin-catalog-react/testUtils';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import orgPlugin from '@backstage/plugin-org/alpha';
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Entity } from '@backstage/catalog-model';

const entities: Entity[] = [
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'example',
      annotations: {
        'backstage.io/managed-by-location': 'file:/path/to/catalog-info.yaml',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'guest',
    },
  },
  {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Group',
    metadata: {
      name: 'admins',
    },
    spec: {
      type: 'team',
    },
  },
];

const catalogApi = catalogApiMock({ entities });

const catalogPluginOverrides = createFrontendModule({
  pluginId: 'catalog',
  extensions: [
    ApiBlueprint.make({
      params: defineParams =>
        defineParams({
          api: catalogApiRef,
          deps: {},
          factory: () => catalogApi,
        }),
    }),
  ],
});

const app = createApp({
  features: [
    catalogPlugin,
    catalogPluginOverrides,
    teamInsightsPlugin,
    orgPlugin,
  ],
});
ReactDOM.createRoot(document.getElementById('root')!).render(app.createRoot());
