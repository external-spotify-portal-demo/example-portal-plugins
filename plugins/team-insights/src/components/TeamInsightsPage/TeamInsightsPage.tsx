// plugins/team-insights/src/components/TeamInsightsPage/TeamInsightsPage.tsx
import { Page, Header, Content } from '@backstage/core-components';
import {
  Box,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import { FRESHNESS_COLORS } from '../shared/freshnessColors';
import type { TeamInsightsStats } from '../../hooks';
import { useApi } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { useAsync } from 'react-use';

// Mocked data for demonstration purposes.
// In a real implementation, this would be fetched from an API based
// on the actual groups and their owned components.
const STUB_STATS: TeamInsightsStats[] = [
  {
    withDocs: 3,
    totalOwned: 10,
    ages: { '0-30': 1, '31-90': 1, '90+': 1 },
    withoutDocsRefs: ['component:default/foo', 'component:default/bar'],
    stalest: [{ ref: 'component:default/foo', daysOld: 120 }],
  },
  {
    withDocs: 8,
    totalOwned: 10,
    ages: { '0-30': 5, '31-90': 2, '90+': 1 },
    withoutDocsRefs: [],
    stalest: [{ ref: 'component:default/baz', daysOld: 95 }],
  },
  {
    withDocs: 0,
    totalOwned: 10,
    ages: { '0-30': 0, '31-90': 0, '90+': 0 },
    withoutDocsRefs: Array.from(
      { length: 10 },
      (_, i) => `component:default/c${i}`,
    ),
    stalest: [],
  },
];

export function TeamInsightsPage() {
  const catalog = useApi(catalogApiRef);

  const { value: groups } = useAsync(async () => {
    const entities = await catalog.getEntities({ filter: { kind: 'Group' } });
    return entities.items
      .map(e => ({
        name: e.metadata.name,
        stats: STUB_STATS[e.metadata.name.length % STUB_STATS.length],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [catalog]);

  return (
    <Page themeId="tool">
      <Header
        title="Team Insights"
        subtitle="Documentation health across all teams"
      />
      <Content>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Team</TableCell>
              <TableCell style={{ width: 220 }}>Coverage</TableCell>
              <TableCell>Freshness</TableCell>
              <TableCell>Missing Docs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups?.map(({ name, stats }) => {
              const coverage =
                Math.round((stats.withDocs / stats.totalOwned) * 100) || 0;
              return (
                <TableRow key={name}>
                  <TableCell>
                    <Typography
                      variant="body2"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                      <Box flex={1}>
                        <LinearProgress
                          variant="determinate"
                          value={coverage}
                          style={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        style={{ minWidth: 36, textAlign: 'right' }}
                      >
                        {coverage}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" style={{ gap: 6 }}>
                      {(['0-30', '31-90', '90+'] as const).map(bucket => (
                        <Box
                          key={bucket}
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: FRESHNESS_COLORS[bucket],
                            opacity: stats.ages[bucket] > 0 ? 1 : 0.2,
                          }}
                          title={`${bucket} days: ${stats.ages[bucket]}`}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {stats.withoutDocsRefs.length === 0 ? (
                      <Box
                        display="flex"
                        alignItems="center"
                        style={{ gap: 4 }}
                      >
                        <CheckCircleIcon
                          style={{ color: '#4caf50', fontSize: 16 }}
                        />
                        <Typography variant="caption">All Set!</Typography>
                      </Box>
                    ) : (
                      <Chip
                        icon={<WarningIcon />}
                        label={`${stats.withoutDocsRefs.length} missing`}
                        size="small"
                        color="secondary"
                      />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Content>
    </Page>
  );
}
