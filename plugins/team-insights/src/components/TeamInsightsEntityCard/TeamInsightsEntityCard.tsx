import { InfoCard } from '@backstage/core-components';
import {
  Box,
  Chip,
  LinearProgress,
  Typography,
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import { useTeamInsightsStats } from '../../hooks';
import { FRESHNESS_COLORS, getAgeColor } from '../shared/freshnessColors';

export const TeamInsightsEntityCard = () => {
  const stats = useTeamInsightsStats();
  const coverage = Math.round((stats.withDocs / stats.totalOwned) * 100) || 0;
  const topStalest = stats.stalest[0];

  return (
    <InfoCard title="Team Insights">
      {/* Coverage row */}
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography variant="caption" color="textSecondary">
            Documentation Coverage
          </Typography>
          <Typography variant="caption">
            <strong>{coverage}%</strong> &mdash; {stats.withDocs} / {stats.totalOwned} entities
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={coverage}
          style={{ height: 6, borderRadius: 3 }}
        />
      </Box>

      {/* Freshness row */}
      <Box mb={2}>
        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
          Freshness
        </Typography>
        <Box display="flex" style={{ gap: 12 }}>
          {(['0-30', '31-90', '90+'] as const).map(bucket => (
            <Box key={bucket} display="flex" alignItems="center" style={{ gap: 4 }}>
              <Box
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: FRESHNESS_COLORS[bucket],
                }}
              />
              <Typography variant="caption">
                {bucket}: <strong>{stats.ages[bucket]}</strong>
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Missing TechDocs row */}
      <Box mb={2}>
        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
          Missing TechDocs
        </Typography>
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
      </Box>

      {/* Stalest doc row */}
      <Box>
        <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
          Stalest Doc
        </Typography>
        {!topStalest ? (
          <Typography variant="caption" color="textSecondary">
            No data available
          </Typography>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="caption" style={{ fontFamily: 'monospace' }}>
              {topStalest.ref}
            </Typography>
            <Chip
              label={`${topStalest.daysOld}d`}
              size="small"
              style={{
                backgroundColor: getAgeColor(topStalest.daysOld),
                color: 'white',
              }}
            />
          </Box>
        )}
      </Box>
    </InfoCard>
  );
};
