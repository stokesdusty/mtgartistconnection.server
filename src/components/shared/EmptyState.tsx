import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { SxProps, Theme } from '@mui/material';
import { colors } from '../../styles/design-tokens';

const CardDiamondMark: React.FC = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="58" height="58" rx="5" stroke={colors.neutral[300]} strokeWidth="1.5" />
    <ellipse cx="32" cy="32" rx="18" ry="22" stroke={colors.neutral[300]} strokeWidth="1.5" />
    <path d="M32 14 L46 32 L32 50 L18 32 Z" fill={colors.neutral[200]} stroke={colors.neutral[300]} strokeWidth="1.5" />
    <circle cx="32" cy="32" r="4" fill={colors.neutral[400]} />
  </svg>
);

interface EmptyStateAction {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface EmptyStateProps {
  headline: string;
  body?: string;
  action?: EmptyStateAction;
  sx?: SxProps<Theme>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ headline, body, action, sx }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      py: 6,
      px: 3,
      ...sx,
    }}
  >
    <CardDiamondMark />
    <Typography
      sx={{
        mt: 2,
        fontWeight: 500,
        color: colors.neutral[700],
        fontSize: '1rem',
      }}
    >
      {headline}
    </Typography>
    {body && (
      <Typography
        sx={{
          mt: 0.5,
          color: colors.neutral[500],
          fontSize: '0.875rem',
        }}
      >
        {body}
      </Typography>
    )}
    {action && (
      <Button
        variant="outlined"
        size="small"
        {...(action.href
          ? { component: RouterLink, to: action.href }
          : { onClick: action.onClick })}
        sx={{
          mt: 2.5,
          borderColor: colors.neutral[300],
          color: colors.neutral[700],
          fontSize: '0.8125rem',
          textTransform: 'none',
          borderRadius: '6px',
          '&:hover': {
            borderColor: colors.primary.main,
            color: colors.primary.main,
            backgroundColor: colors.primary.lighter,
          },
        }}
      >
        {action.label}
      </Button>
    )}
  </Box>
);

export default EmptyState;
