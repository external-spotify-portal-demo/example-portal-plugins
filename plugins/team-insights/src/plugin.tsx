import {
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import {
  EntityCardBlueprint,
  EntityContentBlueprint,
} from '@backstage/plugin-catalog-react/alpha';
import GroupIcon from '@material-ui/icons/Group';
import { teamInsightsRouteRef } from './routes';

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

const teamInsightsPage = PageBlueprint.make({
  params: {
    path: '/team-insights',
    routeRef: teamInsightsRouteRef,
    title: 'Team Insights',
    icon: <GroupIcon />,
    loader: () =>
      import('./components/TeamInsightsPage').then(m => <m.TeamInsightsPage />),
  },
});

export const teamInsightsPlugin = createFrontendPlugin({
  pluginId: 'team-insights',
  routes: { root: teamInsightsRouteRef },
  extensions: [
    teamInsightsEntityContent,
    teamInsightsEntityCard,
    teamInsightsPage,
  ],
});
