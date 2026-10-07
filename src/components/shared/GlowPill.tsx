import { ElementType, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, SxProps, Theme } from '@mui/material';
import {
  onArt,
  onArtAccent,
  vault,
  vaultEffects,
  vaultMedia,
  vaultRadii,
} from '../../styles/design-tokens';

/** 6px accent dot with a glow — marks live or upcoming signings. */
export const LiveDot = ({
  size = 6,
  color = vault.accent,
  glow = true,
}: { size?: number; color?: string; glow?: boolean }) => (
  <Box
    component="span"
    aria-hidden
    sx={{
      flex: 'none',
      width: size,
      height: size,
      borderRadius: '50%',
      backgroundColor: color,
      boxShadow: glow ? `0 0 ${size + 2}px ${color}` : 'none',
    }}
  />
);

const SIZES = {
  sm: { padding: '3px 8px', fontSize: 11, gap: '6px', dot: 5 },
  md: { padding: '8px 14px', fontSize: 13, gap: '8px', dot: 6 },
};

interface GlowPillProps {
  children: ReactNode;
  /** `onArt` is the fixed dark treatment for badges sitting on artwork. */
  variant?: 'default' | 'onArt';
  size?: keyof typeof SIZES;
  dot?: boolean;
  /** Internal route — renders a react-router Link. */
  to?: string;
  /** External URL — renders an anchor opening in a new tab. */
  href?: string;
  onClick?: () => void;
  title?: string;
  sx?: SxProps<Theme>;
}

/** Accent pill for signing status ("IX Art Show · Oct 21", "In 3 days"). */
const GlowPill = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = true,
  to,
  href,
  onClick,
  title,
  sx,
}: GlowPillProps) => {
  const s = SIZES[variant === 'onArt' ? 'sm' : size];
  const isOnArt = variant === 'onArt';
  const interactive = Boolean(to || href || onClick);

  const element: ElementType = to ? RouterLink : href ? 'a' : onClick ? 'button' : 'span';

  return (
    <Box
      component={element}
      to={to}
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      type={element === 'button' ? 'button' : undefined}
      onClick={onClick}
      title={title}
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: s.gap,
          maxWidth: '100%',
          padding: isOnArt ? '5px 9px' : s.padding,
          borderRadius: vaultRadii.pill,
          fontFamily: 'inherit',
          fontSize: s.fontSize,
          fontWeight: 500,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          textDecoration: 'none',
          ...(isOnArt
            ? {
                backgroundColor: onArt.badgeBg,
                backdropFilter: onArt.badgeBlur,
                WebkitBackdropFilter: onArt.badgeBlur,
                border: `1px solid ${onArtAccent.border}`,
                color: onArtAccent.text,
              }
            : {
                backgroundColor: vault.glow,
                border: `1px solid ${vault.accent}`,
                color: vault.accentText,
              }),
          ...(interactive && {
            cursor: 'pointer',
            transition: `background-color ${vaultEffects.transition}, box-shadow ${vaultEffects.transition}`,
            '&:hover': { backgroundColor: vault.glowStrong },
            '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
          }),
          [vaultMedia.mobile]: interactive ? { minHeight: 40 } : {},
          '& > .glow-pill-text': { overflow: 'hidden', textOverflow: 'ellipsis' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {dot && <LiveDot size={s.dot} color={isOnArt ? onArtAccent.dot : vault.accent} />}
      <span className="glow-pill-text">{children}</span>
    </Box>
  );
};

export default GlowPill;
