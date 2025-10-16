import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  coverageCard: {
    height: '100%',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white,
  },
  coverageContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(4),
  },
  percentageCircle: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    border: `8px solid ${theme.palette.common.white}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
    position: 'relative',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  freshnessBar: {
    height: 40,
    borderRadius: theme.spacing(1),
    display: 'flex',
    overflow: 'hidden',
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.grey[200],
  },
  freshnessSegment: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
    fontWeight: 'bold',
    fontSize: '0.875rem',
    transition: 'all 0.3s ease',
    '&:hover': {
      opacity: 0.8,
      transform: 'scaleY(1.1)',
    },
  },
  legendContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: theme.spacing(2),
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing(2),
    opacity: 0.5,
  },
  listItem: {
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  codeChip: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
  },
  warningCard: {
    borderLeft: `4px solid ${theme.palette.warning.main}`,
  },
  successCard: {
    borderLeft: `4px solid ${theme.palette.success.main}`,
  },
  iconAvatar: {
    backgroundColor: theme.palette.primary.light,
  },
}));
