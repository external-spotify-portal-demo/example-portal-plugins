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
import { useAllTeamInsightsStats } from '../../hooks';
import type { TeamInsightsStats } from '../../hooks';

const MATURITY_COLORS = {
  production: '#4caf50',
  experimental: '#ff9800',
  deprecated: '#f44336',
} as const;

function MaturityDots({ maturity }: { maturity: TeamInsightsStats['maturity'] }) {
  return (
    <Box display="flex" style={{ gap: 6 }}>
      {(
        Object.entries(MATURITY_COLORS) as [
          keyof typeof MATURITY_COLORS,
          string,
        ][]
      ).map(([stage, color]) => (
        <Box
          key={stage}
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: color,
            opacity: maturity[stage] > 0 ? 1 : 0.2,
          }}
          title={`${stage}: ${maturity[stage]}`}
        />
      ))}
    </Box>
  );
}

export function TeamInsightsPage() {
  const { stats: teams, loading, error } = useAllTeamInsightsStats();

  return (
    <Page themeId="tool">
      <Header
        title="Team Insights"
        subtitle="Health metrics across all teams"
      />
      <Content>
        {loading && <LinearProgress />}
        {error && (
          <Typography color="error">
            Failed to load team insights: {error.message}
          </Typography>
        )}
        {teams && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Team</TableCell>
                <TableCell>Entities</TableCell>
                <TableCell>Maturity</TableCell>
                <TableCell style={{ width: 180 }}>Docs Coverage</TableCell>
                <TableCell style={{ width: 180 }}>Completeness</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams
                .sort((a, b) => a.teamRef.localeCompare(b.teamRef))
                .map(team => {
                  const docsPct = team.docs.total > 0
                    ? Math.round(
                        (team.docs.covered / team.docs.total) * 100,
                      )
                    : 0;
                  const complPct = team.completeness.total > 0
                    ? Math.round(
                        ((team.completeness.withDescription +
                          team.completeness.withTags +
                          team.completeness.withLifecycle) /
                          (team.completeness.total * 3)) *
                          100,
                      )
                    : 0;
                  const name = team.teamRef.split('/').pop() ?? team.teamRef;

                  return (
                    <TableRow key={team.teamRef}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          style={{ fontFamily: 'monospace' }}
                        >
                          {name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={team.ownership.total}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <MaturityDots maturity={team.maturity} />
                      </TableCell>
                      <TableCell>
                        <Box
                          display="flex"
                          alignItems="center"
                          style={{ gap: 8 }}
                        >
                          <Box flex={1}>
                            <LinearProgress
                              variant="determinate"
                              value={docsPct}
                              style={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            style={{ minWidth: 36, textAlign: 'right' }}
                          >
                            {docsPct}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          display="flex"
                          alignItems="center"
                          style={{ gap: 8 }}
                        >
                          <Box flex={1}>
                            <LinearProgress
                              variant="determinate"
                              value={complPct}
                              style={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            style={{ minWidth: 36, textAlign: 'right' }}
                          >
                            {complPct}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        )}
      </Content>
    </Page>
  );
}
