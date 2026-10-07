import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { GridDensity } from "./DensityToggle";
import { MEDIA_BASE_URL as S3 } from "../../config/media";
import Slab from "../shared/Slab";
import GlowPill from "../shared/GlowPill";
import { artistGridStyles } from "../../styles/artist-grid-styles";
import { vaultMedia } from "../../styles/design-tokens";

// React <19 doesn't recognize `fetchPriority` (camelCase) at runtime — it was only
// added in React 19. Lowercase props are passed through to the DOM silently.
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

/** An upcoming signing shown as a badge on the tile ("IX Art Show · Oct 21"). */
export interface TileEvent {
  name: string;
  /** Short date, e.g. "Oct 21". */
  date: string;
}

interface ArtistGridItemProps {
  artistData: { name: string; filename: string; location?: string; alternate_names?: string };
  eager?: boolean;
  /** Next signing within 30 days, if any. */
  event?: TileEvent;
  density?: GridDensity;
}

const ArtistGridItem = ({ artistData, eager, event, density = 'comfortable' }: ArtistGridItemProps) => {
  const { name, filename, location, alternate_names } = artistData;
  const isDense = density === 'compact';
  const isBanner = density === 'gallery';

  // Grid and Dense use the square grid crop (300×300); Banner uses the wide banner art.
  const useGridImage = !isBanner;
  const src = useGridImage ? `${S3}/grid/${filename}.jpg` : `${S3}/banner/${filename}.jpeg`;
  const sizes = isDense
    ? '(max-width: 600px) calc(33vw - 16px), 180px'
    : isBanner
      ? '(max-width: 720px) calc(100vw - 36px), (max-width: 1100px) calc(50vw - 40px), calc(33vw - 40px)'
      : '(max-width: 720px) calc(50vw - 24px), (max-width: 1100px) calc(33vw - 40px), calc(25vw - 40px)';

  const badge = event && !isDense ? (
    <GlowPill variant="onArt">
      {/* Mobile shows the date only */}
      <Box component="span" sx={{ [vaultMedia.mobile]: { display: 'none' } }}>{event.name} · </Box>
      {event.date}
    </GlowPill>
  ) : undefined;

  const meta = isBanner && alternate_names
    ? [location, `aka ${alternate_names}`].filter(Boolean).join(' · ')
    : location || undefined;

  return (
    <Box
      component={RouterLink}
      to={`/artist/${encodeURIComponent(name)}`}
      title={alternate_names ? `${name} (${alternate_names})` : undefined}
      sx={artistGridStyles.link}
    >
      <Slab
        src={src}
        alt={name}
        aspectRatio={isDense ? '1' : isBanner ? '16 / 9' : '5 / 6'}
        mobileAspectRatio={isDense || isBanner ? undefined : '4 / 5'}
        size={isDense ? 'sm' : 'md'}
        captionSize={isDense ? 'sm' : 'md'}
        title={name}
        meta={isDense ? undefined : meta}
        topLeft={badge}
        interactive
        imgProps={{
          srcSet: useGridImage ? `${src} 300w` : `${src} 600w`,
          sizes,
          loading: eager ? 'eager' : 'lazy',
          fetchpriority: eager ? 'high' : undefined,
          width: useGridImage ? 300 : 600,
          height: useGridImage ? 300 : 337,
        }}
      />
    </Box>
  );
};

export default ArtistGridItem;
