import { ReactNode } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { keyframes } from '@emotion/react';
import Slab from './Slab';
import { vault, vaultEffects, vaultLayout, vaultMedia, vaultRadii } from '../../styles/design-tokens';
import { artistGridStyles } from '../../styles/artist-grid-styles';
import { artistStyles } from '../../styles/artist-styles';
import { calendarStyles } from '../../styles/calendar-styles';
import { CARD_COL_MIN_WIDTH, CARD_METRICS } from '../../styles/all-cards-styles';
import { yourCardsStyles } from '../../styles/your-cards-styles';
import { followingStyles } from '../../styles/following-styles';
import { settingsStyles } from '../../styles/settings-styles';

// Loading states use the same striped placeholder as missing art, laid out
// with each page's real styles so nothing jumps when data arrives.

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: .55; }
`;

const pulseSx = {
  animation: `${pulse} 1.6s ease-in-out infinite`,
  [vaultMedia.reducedMotion]: { animation: 'none' },
};

const sxList = (sx?: SxProps<Theme>) => (Array.isArray(sx) ? sx : [sx]);

/** Wraps a skeleton: one pulse for the whole block, hidden from screen readers. */
const SkeletonRoot = ({ label, children, sx }: { label: string; children: ReactNode; sx?: SxProps<Theme> }) => (
  <Box role="status" aria-busy="true" aria-label={label} sx={[pulseSx, ...sxList(sx)]}>
    <Box aria-hidden sx={{ display: 'contents' }}>{children}</Box>
  </Box>
);

interface SkeletonBarProps {
  width?: number | string;
  height?: number | string;
  radius?: string;
  /** `solid` for bars that sit on top of a striped area (e.g. the artist banner). */
  tone?: 'stripes' | 'solid';
  sx?: SxProps<Theme>;
}

/** A text line or block in the striped placeholder. */
export const SkeletonBar = ({ width = '100%', height = 14, radius = '6px', tone = 'stripes', sx }: SkeletonBarProps) => (
  <Box
    sx={[
      {
        width,
        maxWidth: '100%',
        height,
        flex: 'none',
        borderRadius: radius,
        background: tone === 'solid' ? vault.chipStrong : vaultEffects.stripes,
      },
      ...sxList(sx),
    ]}
  />
);

// ─── Homepage ────────────────────────────────────────────────────────────────

// Artist grid: same columns and 5:6 → 4:5 slabs as ArtistGridItem.
export const ArtistGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <SkeletonRoot label="Loading artists" sx={artistGridStyles.grid}>
    {Array.from({ length: count }, (_, i) => (
      <Slab key={i} aspectRatio="5 / 6" mobileAspectRatio="4 / 5" />
    ))}
  </SkeletonRoot>
);

// ─── Calendar ────────────────────────────────────────────────────────────────

const EventRowSkeleton = () => (
  <Box component="li" sx={[calendarStyles.row, { '&:hover': { backgroundColor: 'transparent' } }]}>
    <Box sx={calendarStyles.dateCol}>
      <SkeletonBar width={100} height={22} />
      <SkeletonBar width={70} height={11} sx={{ mt: '6px' }} />
    </Box>
    <Box sx={[calendarStyles.dateBlock, { height: 58, background: vaultEffects.stripes }]} />
    <Box sx={calendarStyles.main}>
      <SkeletonBar width="60%" height={18} />
      <SkeletonBar width="35%" height={13} sx={{ mt: '4px' }} />
    </Box>
    <Box sx={calendarStyles.extras}>
      <Box sx={calendarStyles.people}>
        <Box sx={calendarStyles.avatars}>
          {Array.from({ length: 3 }, (_, i) => (
            <Box key={i} sx={[calendarStyles.avatar, { background: vaultEffects.stripes }]} />
          ))}
        </Box>
        <SkeletonBar width={64} height={13} />
      </Box>
      <Box sx={calendarStyles.wishCol} />
    </Box>
    <Box sx={calendarStyles.arrow} />
  </Box>
);

// One month group of event rows, matching Calendar's month list.
export const EventCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <SkeletonRoot label="Loading events" sx={calendarStyles.months}>
    <Box>
      <Box sx={[calendarStyles.monthHeader, { alignItems: 'center' }]}>
        <SkeletonBar width={150} height={22} />
        <SkeletonBar width={56} height={11} />
      </Box>
      <Box component="ul" sx={calendarStyles.eventList}>
        {Array.from({ length: count }, (_, i) => <EventRowSkeleton key={i} />)}
      </Box>
    </Box>
  </SkeletonRoot>
);

// ─── All cards ───────────────────────────────────────────────────────────────

const d = CARD_METRICS.desktop;
const m = CARD_METRICS.mobile;

// Same auto-fill columns as the virtualized grid (always 2 columns on mobile).
export const AllCardsGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <SkeletonRoot
    label="Loading cards"
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_COL_MIN_WIDTH}px, 1fr))`,
      columnGap: `${d.columnGap}px`,
      rowGap: `${d.rowGap}px`,
      [vaultMedia.mobile]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        columnGap: `${m.columnGap}px`,
        rowGap: `${m.rowGap}px`,
      },
    }}
  >
    {Array.from({ length: count }, (_, i) => (
      <Box key={i} sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Slab size="sm" aspectRatio="63 / 88" />
        <SkeletonBar width="75%" height={14} sx={{ mt: `${d.infoGap}px`, [vaultMedia.mobile]: { mt: `${m.infoGap}px` } }} />
        <SkeletonBar width="45%" height={11} sx={{ mt: '6px' }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', mt: `${d.pricesGap}px`, [vaultMedia.mobile]: { mt: `${m.pricesGap}px` } }}>
          {[0, 1].map((p) => (
            <SkeletonBar key={p} height={d.priceHeight} sx={{ [vaultMedia.mobile]: { height: m.priceHeight } }} />
          ))}
        </Box>
        {/* Collection strip: one row of cells on desktop, two on mobile. */}
        <SkeletonBar
          height={d.cellHeight + 2}
          radius="9px"
          sx={{ mt: `${d.stripGap}px`, [vaultMedia.mobile]: { height: m.cellHeight * 2 + 3 } }}
        />
      </Box>
    ))}
  </SkeletonRoot>
);

// ─── Artist page ─────────────────────────────────────────────────────────────

// Banner, sticky rail, link cards, info list + events, and the signature slab.
export const ArtistPageSkeleton = () => (
  <SkeletonRoot label="Loading artist">
    <Box sx={artistStyles.banner}>
      <Box sx={artistStyles.bannerFade} />
      <Box sx={artistStyles.bannerOverlay}>
        <SkeletonBar tone="solid" width={200} height={12} />
        <SkeletonBar
          tone="solid"
          width="min(560px, 70%)"
          height={76}
          radius="10px"
          sx={{ '@media (max-width: 900px)': { height: 58 }, [vaultMedia.mobile]: { height: 44, width: '80%' } }}
        />
      </Box>
    </Box>

    <Box sx={[artistStyles.rail, { position: 'static' }]}>
      <SkeletonBar width={140} height={16} sx={{ [vaultMedia.mobile]: { display: 'none' } }} />
      <Box sx={artistStyles.railSpacer} />
      <SkeletonBar
        width={240}
        height={34}
        radius={vaultRadii.pill}
        sx={{ [vaultMedia.mobile]: { width: '100%', height: 46, borderRadius: '12px' } }}
      />
      <SkeletonBar
        width={92}
        height={34}
        radius="9px"
        sx={{ [vaultMedia.mobile]: { width: '100%', height: 48, borderRadius: '12px' } }}
      />
    </Box>

    <Box sx={artistStyles.linkCards}>
      {Array.from({ length: 4 }, (_, i) => (
        <SkeletonBar key={i} height={92} radius={vaultRadii.card} sx={{ [vaultMedia.mobile]: { height: 80 } }} />
      ))}
    </Box>

    <Box sx={artistStyles.columns}>
      <Box sx={artistStyles.mainColumn}>
        <Box>
          <SkeletonBar width={96} height={11} sx={{ mb: '8px' }} />
          {[55, 40, 30, 25, 20, 45].map((w, i) => (
            <Box key={i} sx={artistStyles.infoRow}>
              <SkeletonBar width={110} height={14} />
              <SkeletonBar width={`${w + 20}%`} height={16} />
            </Box>
          ))}
        </Box>
        <Box>
          <SkeletonBar width={150} height={22} />
          <Box sx={artistStyles.eventsGrid}>
            {[0, 1].map((i) => (
              <Box key={i} sx={[artistStyles.eventCard, { cursor: 'default', '&:hover': {} }]}>
                <SkeletonBar width={56} height={58} radius={vaultRadii.input} />
                <Box sx={[artistStyles.eventText, { flex: 1, gap: '8px' }]}>
                  <SkeletonBar width="70%" height={15} />
                  <SkeletonBar width="50%" height={12} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={artistStyles.sideColumn}>
        <Box sx={artistStyles.signature}>
          <SkeletonBar width={150} height={11} />
          <Slab size="lg" aspectRatio="63 / 88" sx={artistStyles.signatureSlab} />
        </Box>
      </Box>
    </Box>
  </SkeletonRoot>
);

// ─── News ────────────────────────────────────────────────────────────────────

const panelSx = {
  padding: '20px',
  borderRadius: vaultRadii.panel,
  backgroundColor: vault.surface,
  border: `1px solid ${vault.line}`,
  [vaultMedia.mobile]: { padding: '16px' },
};

export const NewsCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <SkeletonRoot label="Loading news" sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {Array.from({ length: count }, (_, i) => (
      <Box key={i} sx={panelSx}>
        <Box sx={{ display: 'flex', gap: '16px', mb: '16px' }}>
          <Slab size="sm" aspectRatio="1" sx={{ width: 56, flex: 'none', [vaultMedia.mobile]: { width: 48 } }} />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', pt: '4px' }}>
            <SkeletonBar width="80%" height={20} />
            <SkeletonBar width="35%" height={12} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: '8px', mb: '16px' }}>
          <SkeletonBar width={96} height={24} radius={vaultRadii.pill} />
          <SkeletonBar width={120} height={24} radius={vaultRadii.pill} />
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonBar height={13} />
          <SkeletonBar width="90%" height={13} />
          <SkeletonBar width="65%" height={13} />
        </Box>
      </Box>
    ))}
  </SkeletonRoot>
);

// ─── Dashboard ───────────────────────────────────────────────────────────────

const dashboardRow = (key: number, first: boolean, children: ReactNode) => (
  <Box
    key={key}
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      py: '12px',
      borderTop: first ? 'none' : `1px solid ${vault.line}`,
    }}
  >
    {children}
  </Box>
);

// Greeting, quick stats, next signings, recently followed, tools grid.
export const DashboardSkeleton = () => (
  <SkeletonRoot
    label="Loading dashboard"
    sx={{
      maxWidth: 900,
      mx: 'auto',
      padding: `64px ${vaultLayout.gutter} 72px`,
      [vaultMedia.mobile]: { padding: `40px ${vaultLayout.gutterMobile} 48px` },
    }}
  >
    <SkeletonBar width={160} height={12} sx={{ mb: '16px' }} />
    <SkeletonBar width="70%" height={52} radius="8px" sx={{ mb: '36px' }} />

    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', mb: '48px' }}>
      {Array.from({ length: 3 }, (_, i) => (
        <Box key={i} sx={[panelSx, { display: 'flex', flexDirection: 'column', gap: '10px' }]}>
          <SkeletonBar width="40%" height={28} />
          <SkeletonBar width="70%" height={12} />
        </Box>
      ))}
    </Box>

    <Box sx={{ mb: '40px' }}>
      <SkeletonBar width={130} height={11} sx={{ mb: '8px' }} />
      {Array.from({ length: 3 }, (_, i) =>
        dashboardRow(i, i === 0, (
          <>
            <SkeletonBar width="55%" height={18} />
            <SkeletonBar width={60} height={12} />
          </>
        ))
      )}
    </Box>

    <Box sx={{ mb: '40px' }}>
      <SkeletonBar width={190} height={22} sx={{ mb: '8px' }} />
      {Array.from({ length: 4 }, (_, i) => dashboardRow(i, i === 0, <SkeletonBar width="40%" height={18} />))}
    </Box>

    <SkeletonBar width={120} height={22} sx={{ mb: '16px' }} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: '12px' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <Box key={i} sx={[panelSx, { display: 'flex', flexDirection: 'column', gap: '8px' }]}>
          <SkeletonBar width={22} height={22} />
          <SkeletonBar width="70%" height={15} />
          <SkeletonBar width="90%" height={12} />
        </Box>
      ))}
    </Box>
  </SkeletonRoot>
);

// ─── Your cards ──────────────────────────────────────────────────────────────

// Header, totals, then artist rows laid out like the real table.
export const YourCardsSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <Box sx={yourCardsStyles.page}>
    <SkeletonRoot label="Loading your cards" sx={yourCardsStyles.inner}>
      <SkeletonBar width={180} height={12} sx={{ mb: '16px' }} />
      <SkeletonBar width={300} height={52} radius="8px" />

      <Box sx={yourCardsStyles.stats}>
        {Array.from({ length: 3 }, (_, i) => (
          <Box key={i} sx={yourCardsStyles.stat}>
            <SkeletonBar width="40%" height={36} />
            <SkeletonBar width="60%" height={11} />
          </Box>
        ))}
      </Box>

      <Box sx={yourCardsStyles.headerRow}>
        <SkeletonBar width={60} height={11} />
      </Box>
      {Array.from({ length: rows }, (_, i) => (
        <Box key={i} sx={[yourCardsStyles.row, { '&:hover': {} }]}>
          <Box sx={yourCardsStyles.artist}>
            <SkeletonBar width={36} height={36} radius="50%" />
            <SkeletonBar width={`${45 + ((i * 17) % 30)}%`} height={16} />
          </Box>
          {Array.from({ length: 3 }, (_, j) => (
            <SkeletonBar key={j} width={28} height={14} sx={{ justifySelf: 'center' }} />
          ))}
        </Box>
      ))}
    </SkeletonRoot>
  </Box>
);

// ─── Following ───────────────────────────────────────────────────────────────

// Header + tabs, section title, add row, then followed-artist rows.
export const FollowingSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <Box sx={followingStyles.page}>
    <SkeletonRoot label="Loading following" sx={followingStyles.inner}>
      <Box sx={followingStyles.hero}>
        <Box>
          <SkeletonBar width={180} height={12} sx={{ mb: '16px' }} />
          <SkeletonBar width={280} height={52} radius="8px" />
        </Box>
        <SkeletonBar width={170} height={42} radius={vaultRadii.segmented} />
      </Box>

      <Box sx={followingStyles.sectionHeader}>
        <SkeletonBar width={190} height={22} />
      </Box>
      <Box sx={followingStyles.addRow}>
        <SkeletonBar height={44} radius="9px" sx={{ flex: 1 }} />
        <SkeletonBar width={100} height={44} radius="9px" />
      </Box>

      {Array.from({ length: rows }, (_, i) => (
        <Box key={i} sx={[followingStyles.row, { '&:hover': {} }]}>
          <SkeletonBar width={36} height={36} radius="50%" />
          <Box sx={{ flex: 1 }}>
            <SkeletonBar width={`${35 + ((i * 17) % 30)}%`} height={16} />
          </Box>
          <SkeletonBar width={90} height={32} radius={vaultRadii.pill} />
        </Box>
      ))}
    </SkeletonRoot>
  </Box>
);

// ─── Settings ────────────────────────────────────────────────────────────────

// Header, then the account, email-preference and password panels.
export const SettingsSkeleton = () => (
  <Box sx={settingsStyles.page}>
    <SkeletonRoot label="Loading settings" sx={settingsStyles.inner}>
      <SkeletonBar width={90} height={12} sx={{ mb: '16px' }} />
      <SkeletonBar width={240} height={52} radius="8px" sx={{ mb: '40px' }} />

      <Box sx={settingsStyles.sections}>
        {[2, 4, 3].map((rows, i) => (
          <Box key={i} sx={settingsStyles.panel}>
            <SkeletonBar width={200} height={22} sx={{ mb: '20px' }} />
            {Array.from({ length: rows }, (_, j) => (
              <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px', py: '12px', borderTop: `1px solid ${vault.line}` }}>
                <SkeletonBar width={`${40 + ((j * 13) % 25)}%`} height={15} />
                <SkeletonBar width={38} height={20} radius={vaultRadii.pill} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </SkeletonRoot>
  </Box>
);
