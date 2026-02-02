import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import { EntityContentBlueprint } from '@backstage/plugin-catalog-react/alpha';

const teamInsightsEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/insights',
    title: 'Team Insights',
    filter: {
      $all: [
        { kind: 'group' },
        { 'spec.type': 'team' },
      ]
    },
    loader: () =>
      import('./components/TeamInsightsEntityContent').then(m => (
        <m.TeamInsightsEntityContent />
      )),
  },
});

export const teamInsightsPlugin = createFrontendPlugin({
  pluginId: 'team-insights',
  extensions: [teamInsightsEntityContent],
});
