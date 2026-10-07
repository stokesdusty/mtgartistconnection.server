import { ImgHTMLAttributes, ReactNode, SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import {
  onArt,
  typography,
  vault,
  vaultEffects,
  vaultMedia,
  vaultRadii,
} from '../../styles/design-tokens';

// md = artist/event tiles, sm = card grid, lg = signature showcase.
const SIZES = {
  sm: { padding: 5, radius: vaultRadii.slab, inner: '10px', shadow: `0 10px 26px ${vault.shadow}` },
  md: { padding: 6, radius: vaultRadii.slab, inner: '9px', shadow: vaultEffects.slabShadow },
  lg: { padding: 8, radius: vaultRadii.slabSignature, inner: vaultRadii.slabInner, shadow: `0 20px 50px ${vault.shadow}` },
};

interface SlabProps {
  src?: string;
  alt?: string;
  /** Extra attributes for the <img> (srcSet, sizes, loading, …). */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
  /** CSS aspect-ratio of the art window, e.g. '5 / 6', '63 / 88', '1'. */
  aspectRatio?: string;
  /** Aspect ratio at ≤600px, when it differs (e.g. homepage tiles go 5:6 → 4:5). */
  mobileAspectRatio?: string;
  /** `sm` shrinks the caption for dense grids. */
  captionSize?: 'md' | 'sm';
  size?: keyof typeof SIZES;
  /** Name overlaid bottom-left on a dark scrim. */
  title?: ReactNode;
  /** Mono line under the title (location, set · number). */
  meta?: ReactNode;
  /** Badge slots, inset 10px from the corners (use GlowPill variant="onArt"). */
  topLeft?: ReactNode;
  topRight?: ReactNode;
  /** Lift + accent border + glow on hover. Wrap in a Link for navigation. */
  interactive?: boolean;
  /** Custom content inside the art window (e.g. a DFC flip). Rendered above the image. */
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * Framed, sleeve-like art tile. Missing or loading images show the striped
 * placeholder instead of a broken-image icon.
 */
const Slab = ({
  src,
  alt = '',
  imgProps,
  aspectRatio = '5 / 6',
  mobileAspectRatio,
  captionSize = 'md',
  size = 'md',
  title,
  meta,
  topLeft,
  topRight,
  interactive = false,
  children,
  sx,
}: SlabProps) => {
  const s = SIZES[size];
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    // A cached image can finish before React attaches onLoad.
    setLoaded(Boolean(imgRef.current?.complete && imgRef.current.naturalWidth));
  }, [src]);

  const hasCaption = title !== undefined || meta !== undefined;
  const small = captionSize === 'sm';

  return (
    <Box
      sx={[
        {
          position: 'relative',
          padding: `${s.padding}px`,
          borderRadius: s.radius,
          background: vaultEffects.slabFrame,
          border: `1px solid ${vault.line}`,
          boxShadow: s.shadow,
          transition: `transform ${vaultEffects.transition}, box-shadow ${vaultEffects.transition}, border-color ${vaultEffects.transition}`,
          ...(interactive && {
            cursor: 'pointer',
            '&:hover, a:focus-visible > &': {
              transform: 'translateY(-4px)',
              borderColor: vault.accent,
              boxShadow: vaultEffects.slabHoverShadow,
            },
            [vaultMedia.reducedMotion]: { '&:hover, a:focus-visible > &': { transform: 'none' } },
          }),
          [vaultMedia.mobile]: { padding: '4px', borderRadius: '12px' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          aspectRatio,
          overflow: 'hidden',
          borderRadius: s.inner,
          background: vaultEffects.stripes,
          [vaultMedia.mobile]: { borderRadius: '9px', ...(mobileAspectRatio && { aspectRatio: mobileAspectRatio }) },
        }}
      >
        {src && !failed && (
          <Box
            component="img"
            ref={imgRef}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            {...imgProps}
            onLoad={(e: SyntheticEvent<HTMLImageElement>) => {
              setLoaded(true);
              imgProps?.onLoad?.(e);
            }}
            onError={(e: SyntheticEvent<HTMLImageElement>) => {
              setFailed(true);
              imgProps?.onError?.(e);
            }}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'opacity .3s ease',
            }}
          />
        )}

        {children}

        {hasCaption && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: small ? '10px' : '14px',
              background: onArt.scrim,
              pointerEvents: 'none',
              [vaultMedia.mobile]: { padding: small ? '8px' : '12px' },
            }}
          >
            {title !== undefined && (
              <Box
                component="span"
                sx={{
                  color: onArt.text,
                  fontSize: small ? 13 : 18,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  [vaultMedia.mobile]: { fontSize: small ? 12 : 14 },
                }}
              >
                {title}
              </Box>
            )}
            {meta !== undefined && (
              <Box
                component="span"
                sx={{
                  marginTop: '4px',
                  color: onArt.textSecondary,
                  fontFamily: typography.fontFamily.mono,
                  fontSize: small ? 10 : 11,
                  lineHeight: 1.3,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  [vaultMedia.mobile]: { fontSize: 10 },
                }}
              >
                {meta}
              </Box>
            )}
          </Box>
        )}

        {topLeft && (
          <Box sx={{ position: 'absolute', top: 10, left: 10, right: topRight ? undefined : 10, display: 'flex' }}>
            {topLeft}
          </Box>
        )}
        {topRight && (
          <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex' }}>{topRight}</Box>
        )}
      </Box>
    </Box>
  );
};

export default Slab;
