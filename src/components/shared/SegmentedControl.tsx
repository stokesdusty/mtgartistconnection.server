import { KeyboardEvent, ReactNode, useRef } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { typography, vault, vaultEffects, vaultMedia, vaultRadii } from '../../styles/design-tokens';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  /** Shorter label used at ≤600px, e.g. "3 mo" for "Next 3 months". */
  shortLabel?: ReactNode;
  icon?: ReactNode;
  ariaLabel?: string;
}

// sm = mono toolbar control (Grid / Dense / Banner); md = 13px page control.
const SIZES = {
  sm: {
    outer: { padding: '3px', borderRadius: '8px', border: 'none', fontFamily: typography.fontFamily.mono, fontSize: 11 },
    item: { padding: '5px 10px', borderRadius: '6px' },
    idle: vault.faint,
  },
  md: {
    outer: { padding: '4px', borderRadius: vaultRadii.segmented, border: `1px solid ${vault.line}`, fontFamily: 'inherit', fontSize: 13 },
    item: { padding: '8px 14px', borderRadius: vaultRadii.segmentedInner },
    idle: vault.muted,
  },
};

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: keyof typeof SIZES;
  /** Stretch to full width with equal segments (always on at ≤600px for md). */
  fullWidth?: boolean;
  'aria-label': string;
  sx?: SxProps<Theme>;
}

/** Single-select segmented control with radio-group semantics and arrow-key navigation. */
function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth = false,
  sx,
  ...rest
}: SegmentedControlProps<T>) {
  const s = SIZES[size];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const hasSelection = options.some(o => o.value === value);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
      : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1
      : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const equalSegments = { width: '100%', '& > button': { flex: 1, justifyContent: 'center' } };

  return (
    <Box
      role="radiogroup"
      aria-label={rest['aria-label']}
      sx={[
        {
          display: 'inline-flex',
          flex: 'none',
          gap: '2px',
          maxWidth: '100%',
          backgroundColor: vault.chip,
          whiteSpace: 'nowrap',
          ...s.outer,
          ...(fullWidth && equalSegments),
          [vaultMedia.mobile]: size === 'md'
            ? { ...equalSegments, '& > button': { ...equalSegments['& > button'], padding: '9px 0', minHeight: 40 } }
            : {},
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <Box
            key={opt.value}
            component="button"
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.ariaLabel}
            tabIndex={selected || (!hasSelection && i === 0) ? 0 : -1}
            ref={(el: HTMLButtonElement | null) => { refs.current[i] = el; }}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => handleKeyDown(e, i)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              margin: 0,
              font: 'inherit',
              lineHeight: 1.3,
              cursor: 'pointer',
              ...s.item,
              backgroundColor: selected ? vault.chipStrong : 'transparent',
              color: selected ? vault.fg : s.idle,
              fontWeight: selected ? 600 : 400,
              transition: `background-color ${vaultEffects.transition}, color ${vaultEffects.transition}`,
              '&:hover': { color: vault.fg },
              '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 1 },
            }}
          >
            {opt.icon}
            {opt.shortLabel ? (
              <>
                <Box component="span" sx={{ [vaultMedia.mobile]: { display: 'none' } }}>{opt.label}</Box>
                <Box component="span" sx={{ display: 'none', [vaultMedia.mobile]: { display: 'inline' } }}>{opt.shortLabel}</Box>
              </>
            ) : (
              opt.label
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default SegmentedControl;
