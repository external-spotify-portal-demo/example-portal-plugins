import { InfoCard } from '@backstage/core-components';
import {
  Box,
  Chip,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import { useTeamInsightsStats } from '../../hooks';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';

const MATURITY_COLORS = {
  production: '#4caf50',
  experimental: '#ff9800',
  deprecated: '#f44336',
} as const;

export const TeamInsightsEntityCard = () => {
  const { entity } = useEntity();
  const teamRef = stringifyEntityRef(entity);
  const { stats, loading, error } = useTeamInsightsStats(teamRef);

  if (loading) {
    return (
      <InfoCard title="Team Insights">
        <Box p={2}><LinearProgress /></Box>
      </InfoCard>
    );
  }

  if (error || !stats) {
    return (
      <InfoCard title="Team Insights">
        <Box p={2}>
          <Typography variant="body2" color="textSecondary">
            {error ? 'Failed to load team insights' : 'No data available'}
          </Typography>
        </Box>
      </InfoCard>
    );
  }

  const docsCoverage = stats.docs.total > 0
    ? Math.round((stats.docs.covered / stats.docs.total) * 100)
    : 0;

  const completenessScore = stats.completeness.total > 0
    ? Math.round(
        ((stats.completeness.withDescription +
          stats.completeness.withTags +
          stats.completeness.withLifecycle) /
          (stats.completeness.total * 3)) *
          100,
      )
    : 0;

  return (
    <InfoCard title="Team Insights">
      {/* Ownership */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" color="textSecondary">
            Entities Owned
          </Typography>
          <Typography variant="caption">
            <strong>{stats.ownership.total}</strong>
          </Typography>
        </Box>
        <Box display="flex" style={{ gap: 4 }} flexWrap="wrap">
          {(
            Object.entries(stats.ownership.byKind) as [string, number][]
          ).map(
            ([kind, count]) =>
              count > 0 && (
                <Chip
                  key={kind}
                  label={`${count} ${kind}${count !== 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                />
              ),
          )}
        </Box>
      </Box>

      {/* Maturity */}
      <Box mb={2}>
        <Typography
          variant="caption"
          color="textSecondary"
          display="block"
          gutterBottom
        >
          Software Maturity
        </Typography>
        <Box display="flex" style={{ gap: 4 }} flexWrap="wrap">
          {(
            Object.entries(MATURITY_COLORS) as [
              keyof typeof MATURITY_COLORS,
              string,
            ][]
          ).map(
            ([stage, color]) =>
              stats.maturity[stage] > 0 && (
                <Chip
                  key={stage}
                  label={`${stats.maturity[stage]} ${stage}`}
                  size="small"
                  style={{ backgroundColor: color, color: 'white' }}
                />
              ),
          )}
        </Box>
      </Box>

      {/* Documentation */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" color="textSecondary">
            Documentation
          </Typography>
          <Typography variant="caption">
            <strong>{docsCoverage}%</strong>
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={docsCoverage}
          style={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Completeness */}
      <Box>
        <Box display="flex" justifyContent="space-between" mb={0.5}>
          <Typography variant="caption" color="textSecondary">
            Catalog Completeness
          </Typography>
          <Typography variant="caption">
            <strong>{completenessScore}%</strong>
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completenessScore}
          style={{ height: 6, borderRadius: 3 }}
        />
      </Box>
    </InfoCard>
  );
};
