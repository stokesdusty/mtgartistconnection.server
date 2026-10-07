import { forwardRef, MouseEvent, ReactNode } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { CaretDown } from '@phosphor-icons/react';
import { vault, vaultEffects, vaultMedia, vaultRadii } from '../../styles/design-tokens';
import { LiveDot } from './GlowPill';

interface FilterChipProps {
  children: ReactNode;
  active?: boolean;
  /** Show the live dot (e.g. "Signing soon"); it glows only while active. */
  live?: boolean;
  /** Adds a ▾ caret — for chips that open a menu or sheet. */
  dropdown?: boolean;
  /** Appended as "· n", e.g. "Filters · 2". */
  count?: number;
  icon?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  title?: string;
  'aria-label'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'dialog' | 'listbox';
  'aria-expanded'?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Pill toggle used in filter rows. Toggles expose aria-pressed; dropdown chips
 * forward their ref so they can anchor an MUI Menu/Popover.
 */
const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(({
  children,
  active = false,
  live = false,
  dropdown = false,
  count,
  icon,
  onClick,
  disabled,
  sx,
  ...aria
}, ref) => {
  return (
    <Box
      component="button"
      type="button"
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={dropdown ? undefined : active}
      {...aria}
      sx={[
        {
          flex: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 14px',
          borderRadius: vaultRadii.pill,
          border: `1px solid ${active ? vault.accent : vault.lineStrong}`,
          backgroundColor: active ? vault.glow : 'transparent',
          color: active ? vault.accentText : vault.muted,
          fontFamily: 'inherit',
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          transition: `background-color ${vaultEffects.transition}, border-color ${vaultEffects.transition}, color ${vaultEffects.transition}`,
          '&:hover:not(:disabled)': {
            backgroundColor: active ? vault.glowStrong : vault.chip,
            color: active ? vault.accentText : vault.fg,
          },
          '&:focus-visible': { outline: `2px solid ${vault.accent}`, outlineOffset: 2 },
          '&:disabled': { opacity: 0.5, cursor: 'default' },
          [vaultMedia.mobile]: { padding: '8px 14px', minHeight: 40 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {live && <LiveDot color={active ? vault.accent : vault.faint} glow={active} />}
      {icon}
      <span>
        {children}
        {count !== undefined && count > 0 && ` · ${count}`}
      </span>
      {dropdown && <CaretDown size={11} weight="bold" aria-hidden />}
    </Box>
  );
});

FilterChip.displayName = 'FilterChip';

export default FilterChip;
