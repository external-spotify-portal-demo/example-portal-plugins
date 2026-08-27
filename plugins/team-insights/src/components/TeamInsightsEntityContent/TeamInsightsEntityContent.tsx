import { InfoCard } from '@backstage/core-components';
import { useTeamInsightsStats } from '../../hooks';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { useStyles } from './TeamInsightsEntityContent.styles';
import { useEntity } from '@backstage/plugin-catalog-react';
import { stringifyEntityRef } from '@backstage/catalog-model';

const MATURITY_COLORS = {
  production: '#4caf50',
  experimental: '#ff9800',
  deprecated: '#f44336',
} as const;

const MATURITY_LABELS = {
  production: 'Production',
  experimental: 'Experimental',
  deprecated: 'Deprecated',
} as const;

export const TeamInsightsEntityContent = () => {
  const classes = useStyles();
  const { entity } = useEntity();
  const teamRef = stringifyEntityRef(entity);
  const { stats, loading, error } = useTeamInsightsStats(teamRef);

  if (!stats) {
    return loading ? (
      <Box p={4}>
        <LinearProgress />
      </Box>
    ) : (
      <Box className={classes.emptyState}>
        <Typography variant="h6">
          {error ? 'Failed to load team insights' : 'No data available'}
        </Typography>
      </Box>
    );
  }

  const docsCoverage = stats.docs.total > 0
    ? Math.round((stats.docs.covered / stats.docs.total) * 100)
    : 0;

  const maturityTotal = Math.max(
    1,
    stats.maturity.production +
      stats.maturity.experimental +
      stats.maturity.deprecated,
  );

  return (
    <Grid container spacing={3}>
      {/* Ownership Card */}
      <Grid item xs={12} md={4}>
        <Card className={classes.ownershipCard} elevation={4}>
          <CardContent className={classes.ownershipContent}>
            <Box className={classes.totalCircle}>
              <Typography variant="h2" style={{ fontWeight: 'bold' }}>
                {stats.ownership.total}
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom>
              Entities Owned
            </Typography>
            <Box>
              {(
                Object.entries(stats.ownership.byKind) as [string, number][]
              ).map(
                ([kind, count]) =>
                  count > 0 && (
                    <Box key={kind} className={classes.kindRow}>
                      <DescriptionIcon fontSize="small" />
                      <Typography variant="body2">
                        <strong>{count}</strong> {kind}
                        {count !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                  ),
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Maturity Card */}
      <Grid item xs={12} md={8}>
        <InfoCard title="Software Maturity">
          <Box p={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Lifecycle distribution
            </Typography>
            <Box className={classes.maturityBar}>
              {(
                Object.entries(MATURITY_COLORS) as [
                  keyof typeof MATURITY_COLORS,
                  string,
                ][]
              ).map(([stage, color]) => {
                const count = stats.maturity[stage];
                const percentage = (count / maturityTotal) * 100;
                if (percentage === 0) return null;
                return (
                  <Box
                    key={stage}
                    className={classes.maturitySegment}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                    title={`${MATURITY_LABELS[stage]}: ${count}`}
                  >
                    {count > 0 && count}
                  </Box>
                );
              })}
            </Box>
            <Box className={classes.legendContainer}>
              {(
                Object.entries(MATURITY_COLORS) as [
                  keyof typeof MATURITY_COLORS,
                  string,
                ][]
              ).map(([stage, color]) => (
                <Box key={stage} className={classes.legendItem}>
                  <Box
                    className={classes.legendDot}
                    style={{ backgroundColor: color }}
                  />
                  <Typography variant="caption">
                    {MATURITY_LABELS[stage]}:{' '}
                    <strong>{stats.maturity[stage]}</strong>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </InfoCard>
      </Grid>

      {/* Documentation Card */}
      <Grid item xs={12} md={6}>
        <InfoCard
          title="Documentation Coverage"
          className={
            stats.docs.missingRefs.length === 0
              ? classes.successCard
              : classes.warningCard
          }
        >
          {stats.docs.missingRefs.length === 0 ? (
            <Box className={classes.emptyState}>
              <CheckCircleIcon
                className={classes.emptyIcon}
                style={{ color: '#4caf50' }}
              />
              <Typography variant="h6" gutterBottom>
                All Documented!
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All {stats.docs.total} entities have TechDocs
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box p={2} pb={1}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">
                    <strong>{stats.docs.covered}</strong> / {stats.docs.total}{' '}
                    entities documented
                  </Typography>
                  <Typography variant="body2">
                    <strong>{docsCoverage}%</strong>
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={docsCoverage}
                  style={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box p={2} pt={1}>
                <Chip
                  icon={<WarningIcon />}
                  label={`${stats.docs.missingRefs.length} missing docs`}
                  color="secondary"
                  size="small"
                />
              </Box>
              <List dense>
                {stats.docs.missingRefs.map(ref => (
                  <ListItem key={ref} className={classes.listItem}>
                    <ListItemIcon>
                      <Avatar
                        className={classes.iconAvatar}
                        style={{ width: 32, height: 32 }}
                      >
                        <ErrorOutlineIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Chip
                          label={ref}
                          size="small"
                          variant="outlined"
                          className={classes.codeChip}
                        />
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </InfoCard>
      </Grid>

      {/* Catalog Completeness Card */}
      <Grid item xs={12} md={6}>
        <InfoCard title="Catalog Completeness">
          <Box p={2}>
            {(
              [
                ['Description', stats.completeness.withDescription],
                ['Tags', stats.completeness.withTags],
                ['Lifecycle', stats.completeness.withLifecycle],
              ] as const
            ).map(([label, count]) => {
              const pct = stats.completeness.total > 0
                ? Math.round((count / stats.completeness.total) * 100)
                : 0;
              return (
                <Box key={label} className={classes.progressRow}>
                  <Typography
                    variant="body2"
                    className={classes.progressLabel}
                  >
                    {label}
                  </Typography>
                  <Box className={classes.progressBar}>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      style={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    className={classes.progressValue}
                  >
                    <strong>{pct}%</strong>
                  </Typography>
                </Box>
              );
            })}
            <Typography
              variant="caption"
              color="textSecondary"
              display="block"
              style={{ marginTop: 8 }}
            >
              Out of {stats.completeness.total} entities
            </Typography>
          </Box>
        </InfoCard>
      </Grid>
    </Grid>
  );
};
