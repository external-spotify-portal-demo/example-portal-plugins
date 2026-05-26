import {
  createFrontendPlugin,
  PageBlueprint,
  SubPageBlueprint,
} from '@backstage/frontend-plugin-api';
import MenuBookIcon from '@material-ui/icons/MenuBook';
import { rootRouteRef } from './routes';
import { techRadarApi } from '@backstage-community/plugin-tech-radar/alpha';

const docsHubPage = PageBlueprint.make({
  params: {
    path: '/docs-hub',
    routeRef: rootRouteRef,
    title: 'Docs Hub',
    icon: <MenuBookIcon />,
  },
});

const overviewSubPage = SubPageBlueprint.make({
  name: 'overview',
  params: {
    path: 'overview',
    title: 'Overview',
    loader: () =>
      import('./components/OverviewPage').then(m => <m.OverviewPage />),
  },
});

const goldenPathsSubPage = SubPageBlueprint.make({
  name: 'golden-paths',
  params: {
    path: 'golden-paths',
    title: 'Golden Paths',
    loader: () =>
      import('./components/GoldenPathPage').then(m => <m.GoldenPathPage />),
  },
});

const techRadarSubPage = SubPageBlueprint.make({
  name: 'tech-radar',
  params: {
    path: 'tech-radar',
    title: 'Tech Radar',
    loader: () =>
      import('./components/TechRadarPage').then(m => <m.TechRadarPage />),
  },
});

export const docsHubPlugin = createFrontendPlugin({
  pluginId: 'docs-hub',
  routes: { root: rootRouteRef },
  extensions: [
    docsHubPage,
    overviewSubPage,
    goldenPathsSubPage,
    techRadarSubPage,
    techRadarApi,
  ],
});
