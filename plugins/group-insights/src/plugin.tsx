import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

const groupInsightsEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/insights',
    title: 'Group Insights',
    filter: entity => entity.kind === 'Group',
    loader: () =>
      import('./components/GroupInsightsEntityContent').then(m => (
        <m.GroupInsightsEntityContent />
      )),
  },
});

export const groupInsightsPlugin = createFrontendPlugin({
  pluginId: 'group-insights',
  extensions: [groupInsightsEntityContent],
});
