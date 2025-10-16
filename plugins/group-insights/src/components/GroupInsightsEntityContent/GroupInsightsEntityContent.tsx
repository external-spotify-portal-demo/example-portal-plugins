import { useState } from 'react';
import { InfoCard } from '@backstage/core-components';
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
  Divider,
  Avatar,
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import WarningIcon from '@material-ui/icons/Warning';
import ScheduleIcon from '@material-ui/icons/Schedule';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import { useStyles } from './GroupInsightsEntityContent.styles';

export const GroupInsightsEntityContent = () => {
  const classes = useStyles();
  const [stats] = useState<{
    withDocs: number;
    totalOwned: number;
    ages: {
      '0-30': number;
      '31-90': number;
      '90+': number;
    };
    withoutDocsRefs: string[];
    stalest: { ref: string; daysOld: number }[];
  }>({
    withDocs: 3,
    totalOwned: 10,
    ages: {
      '0-30': 0,
      '31-90': 0,
      '90+': 0,
    },
    withoutDocsRefs: [],
    stalest: [],
  });

  const coverage = Math.round((stats.withDocs / stats.totalOwned) * 100) || 0;

  const freshnessColors = {
    '0-30': '#4caf50',
    '31-90': '#ff9800',
    '90+': '#f44336',
  };

  const getFreshnessPercentage = (bucket: '0-30' | '31-90' | '90+') => {
    const total = Math.max(1, stats.withDocs);
    return (stats.ages[bucket] / total) * 100;
  };

  const getAgeColor = (daysOld: number) => {
    if (daysOld > 90) return '#f44336';
    if (daysOld > 30) return '#ff9800';
    return '#4caf50';
  };

  return (
    <Grid container spacing={3}>
      {/* Coverage Card */}
      <Grid item xs={12} md={4}>
        <Card className={classes.coverageCard} elevation={4}>
          <CardContent className={classes.coverageContent}>
            <Box className={classes.percentageCircle}>
              <Typography variant="h2" style={{ fontWeight: 'bold' }}>
                {coverage}%
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom>
              Documentation Coverage
            </Typography>
            <Box className={classes.statsRow}>
              <DescriptionIcon />
              <Typography variant="body1">
                <strong>{stats.withDocs}</strong> / {stats.totalOwned} entities
              </Typography>
            </Box>
            <Box mt={2} width="100%">
              <LinearProgress
                variant="determinate"
                value={coverage}
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Freshness Card */}
      <Grid item xs={12} md={8}>
        <InfoCard title="Documentation Freshness">
          <Box p={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Days since last update
            </Typography>
            <Box className={classes.freshnessBar}>
              {(['0-30', '31-90', '90+'] as const).map(bucket => {
                const percentage = getFreshnessPercentage(bucket);
                const count = stats.ages[bucket];
                if (percentage === 0) return null;
                return (
                  <Box
                    key={bucket}
                    className={classes.freshnessSegment}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: freshnessColors[bucket],
                    }}
                    title={`${bucket} days: ${count} docs`}
                  >
                    {count > 0 && count}
                  </Box>
                );
              })}
            </Box>
            <Box className={classes.legendContainer}>
              {(['0-30', '31-90', '90+'] as const).map(bucket => (
                <Box key={bucket} className={classes.legendItem}>
                  <Box
                    className={classes.legendDot}
                    style={{ backgroundColor: freshnessColors[bucket] }}
                  />
                  <Typography variant="caption">
                    {bucket} days: <strong>{stats.ages[bucket]}</strong>
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </InfoCard>
      </Grid>

      {/* Missing TechDocs Card */}
      <Grid item xs={12} md={6}>
        <InfoCard
          title="Missing TechDocs"
          className={
            stats.withoutDocsRefs.length === 0
              ? classes.successCard
              : classes.warningCard
          }
        >
          {stats.withoutDocsRefs.length === 0 ? (
            <Box className={classes.emptyState}>
              <CheckCircleIcon
                className={classes.emptyIcon}
                style={{ color: '#4caf50' }}
              />
              <Typography variant="h6" gutterBottom>
                All Set!
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All owned entities have TechDocs
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box p={2} pb={1}>
                <Chip
                  icon={<WarningIcon />}
                  label={`${stats.withoutDocsRefs.length} entities without docs`}
                  color="secondary"
                  size="small"
                />
              </Box>
              <List dense>
                {stats.withoutDocsRefs.map((ref: string) => (
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

      {/* Stalest Docs Card */}
      <Grid item xs={12} md={6}>
        <InfoCard title="Stalest Documentation">
          {stats.stalest.length === 0 ? (
            <Box className={classes.emptyState}>
              <TrendingUpIcon className={classes.emptyIcon} />
              <Typography variant="h6" gutterBottom>
                No Data Available
              </Typography>
              <Typography variant="body2" color="textSecondary">
                No documentation found to analyze
              </Typography>
            </Box>
          ) : (
            <List dense>
              {stats.stalest.map((item: any) => (
                <Box key={item.ref}>
                  <ListItem className={classes.listItem}>
                    <ListItemIcon>
                      <Avatar
                        className={classes.iconAvatar}
                        style={{ width: 32, height: 32 }}
                      >
                        <ScheduleIcon fontSize="small" />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Chip
                          label={item.ref}
                          size="small"
                          variant="outlined"
                          className={classes.codeChip}
                        />
                      }
                      secondary={
                        <Typography variant="caption" color="textSecondary">
                          Last updated {item.daysOld} days ago
                        </Typography>
                      }
                    />
                    <Chip
                      label={`${item.daysOld}d`}
                      size="small"
                      style={{
                        backgroundColor: getAgeColor(item.daysOld),
                        color: 'white',
                      }}
                    />
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          )}
        </InfoCard>
      </Grid>
    </Grid>
  );
};
