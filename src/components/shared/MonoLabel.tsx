import { ElementType, ReactNode } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { typography, vault } from '../../styles/design-tokens';

type Tone = 'accent' | 'faint' | 'muted' | 'inherit';

const TONE_COLOR: Record<Tone, string> = {
  accent: vault.accentText,
  faint: vault.faint,
  muted: vault.muted,
  inherit: 'inherit',
};

// tight = toolbar/meta labels, normal = section eyebrows, wide = hero eyebrows
const TRACKING = { tight: '.1em', normal: '.14em', wide: '.2em' };

interface MonoLabelProps {
  children: ReactNode;
  tone?: Tone;
  size?: 10 | 11 | 12;
  tracking?: keyof typeof TRACKING;
  uppercase?: boolean;
  component?: ElementType;
  id?: string;
  sx?: SxProps<Theme>;
}

/** Geist Mono eyebrow / metadata text. */
const MonoLabel = ({
  children,
  tone = 'faint',
  size = 11,
  tracking = 'normal',
  uppercase = true,
  component = 'span',
  id,
  sx,
}: MonoLabelProps) => (
  <Box
    component={component}
    id={id}
    sx={[
      {
        display: 'block',
        margin: 0,
        fontFamily: typography.fontFamily.mono,
        fontSize: size,
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: uppercase ? TRACKING[tracking] : 0,
        textTransform: uppercase ? 'uppercase' : 'none',
        color: TONE_COLOR[tone],
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Box>
);

export default MonoLabel;
