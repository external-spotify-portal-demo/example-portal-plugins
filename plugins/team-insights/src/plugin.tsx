import { createFrontendPlugin } from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';

const teamInsightsEntityContent = EntityContentBlueprint.make({
  params: {
    path: '/insights',
    title: 'Team Insights',
    filter: {
      $all: [{ kind: 'group' }, { 'spec.type': 'team' }],
    },
    loader: () =>
      import('./components/TeamInsightsEntityContent').then(m => (
        <m.TeamInsightsEntityContent />
      )),
  },
});

const teamInsightsEntityCard = EntityCardBlueprint.make({
  params: {
    filter: {
      $all: [{ kind: 'group' }, { 'spec.type': 'team' }],
    },
    loader: () =>
      import('./components/TeamInsightsEntityCard').then(m => (
        <m.TeamInsightsEntityCard />
      )),
  },
});

export const teamInsightsPlugin = createFrontendPlugin({
  pluginId: 'team-insights',
  extensions: [teamInsightsEntityContent, teamInsightsEntityCard],
});
