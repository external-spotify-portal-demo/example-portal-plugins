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

// TODO: replace with real data fetched from the catalog.
// Note: this page intentionally does NOT call useTeamInsightsStats — that hook is
// per-team and used by the entity tab/card. This page needs a multi-team hook
// (e.g. useAllTeamsInsightsStats) that fetches stats for all teams at once.
const STUB_TEAMS: { name: string; stats: TeamInsightsStats }[] = [
  {
    name: 'team-alpha',
    stats: {
      withDocs: 3,
      totalOwned: 10,
      ages: { '0-30': 1, '31-90': 1, '90+': 1 },
      withoutDocsRefs: ['component:default/foo', 'component:default/bar'],
      stalest: [{ ref: 'component:default/foo', daysOld: 120 }],
    },
  },
  {
    name: 'team-beta',
    stats: {
      withDocs: 8,
      totalOwned: 10,
      ages: { '0-30': 5, '31-90': 2, '90+': 1 },
      withoutDocsRefs: [],
      stalest: [{ ref: 'component:default/baz', daysOld: 95 }],
    },
  },
  {
    name: 'team-gamma',
    stats: {
      withDocs: 0,
      totalOwned: 10,
      ages: { '0-30': 0, '31-90': 0, '90+': 0 },
      withoutDocsRefs: Array.from({ length: 10 }, (_, i) => `component:default/c${i}`),
      stalest: [],
    },
  },
];

export const TeamInsightsPage = () => (
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
          {STUB_TEAMS.map(({ name, stats }) => {
            const coverage = Math.round((stats.withDocs / stats.totalOwned) * 100) || 0;
            return (
              <TableRow key={name}>
                <TableCell>
                  <Typography variant="body2" style={{ fontFamily: 'monospace' }}>
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
                    <Typography variant="caption" style={{ minWidth: 36, textAlign: 'right' }}>
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
                    <Box display="flex" alignItems="center" style={{ gap: 4 }}>
                      <CheckCircleIcon style={{ color: '#4caf50', fontSize: 16 }} />
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
