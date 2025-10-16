import { createDevApp } from '@backstage/dev-utils';
import { groupInsightsPlugin, GroupInsightsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(groupInsightsPlugin)
  .addPage({
    element: <GroupInsightsPage />,
    title: 'Root Page',
    path: '/group-insights',
  })
  .render();
