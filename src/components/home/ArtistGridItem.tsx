import { Box } from "@mui/system";
import {
  artistGridStyles,
  artistCompactStyles,
  artistGalleryStyles,
  gridHtmlElementStyles,
} from "../../styles/artist-grid-styles";
import { Link, Typography } from "@mui/material";
import { GridDensity } from "./DensityToggle";

// React <19 doesn't recognize `fetchPriority` (camelCase) at runtime — it was only
// added in React 19. Lowercase props are passed through to the DOM silently.
declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

const S3 = 'https://mtgartistconnection.s3.us-west-1.amazonaws.com';

const ArtistGridItem = ({
  artistData,
  eager,
  hasEvent,
  density = 'comfortable',
}: {
  artistData: any;
  eager?: boolean;
  hasEvent?: boolean;
  density?: GridDensity;
}) => {
  if (density === 'compact') {
    return (
      <Box sx={artistCompactStyles.container}>
        <Link sx={artistCompactStyles.link} href={`/artist/${artistData.name}`}>
          <Box sx={artistCompactStyles.imageBox} className="artist-image-box">
            {hasEvent && <Box sx={artistGridStyles.eventDot} />}
            <img
              alt={artistData.name}
              style={gridHtmlElementStyles.img}
              src={`${S3}/grid/${artistData.filename}.jpg`}
              srcSet={`${S3}/grid/${artistData.filename}.jpg 300w`}
              sizes="(max-width: 600px) calc(33vw - 12px), (max-width: 960px) calc(16vw - 16px), 180px"
              loading={eager ? 'eager' : 'lazy'}
              fetchpriority={eager ? 'high' : undefined}
              decoding="async"
              width="300"
              height="300"
            />
            <Box sx={artistCompactStyles.overlay}>
              <Typography sx={artistCompactStyles.overlayName}>
                {artistData.name}
              </Typography>
            </Box>
          </Box>
        </Link>
      </Box>
    );
  }

  if (density === 'gallery') {
    return (
      <Box sx={artistGalleryStyles.container}>
        <Link sx={artistGalleryStyles.link} href={`/artist/${artistData.name}`}>
          <Box sx={artistGalleryStyles.imageBox} className="artist-image-box">
            {hasEvent && <Box sx={artistGridStyles.eventDot} />}
            <img
              alt={artistData.name}
              style={gridHtmlElementStyles.img}
              src={`${S3}/banner/${artistData.filename}.jpeg`}
              srcSet={`${S3}/banner/${artistData.filename}.jpeg 600w`}
              sizes="(max-width: 600px) calc(100vw - 32px), (max-width: 960px) calc(50vw - 24px), calc(33vw - 24px)"
              loading={eager ? 'eager' : 'lazy'}
              fetchpriority={eager ? 'high' : undefined}
              decoding="async"
              width="600"
              height="337"
            />
            <Box sx={artistGalleryStyles.overlay} className="gallery-overlay">
              <Typography sx={artistGalleryStyles.overlayName}>
                {artistData.name}
                {artistData.alternate_names && (
                  <Typography
                    component="span"
                    sx={{ fontSize: '0.75em', fontWeight: 400, opacity: 0.8, ml: 0.5 }}
                  >
                    ({artistData.alternate_names})
                  </Typography>
                )}
              </Typography>
            </Box>
          </Box>
        </Link>
      </Box>
    );
  }

  // comfortable (default)
  return (
    <Box sx={artistGridStyles.container}>
      <Link sx={artistGridStyles.link} href={`/artist/${artistData.name}`}>
        <Box sx={artistGridStyles.imageBox} className="artist-image-box">
          {hasEvent && <Box sx={artistGridStyles.eventDot} />}
          <img
            alt={artistData.name}
            style={gridHtmlElementStyles.img}
            src={`${S3}/grid/${artistData.filename}.jpg`}
            srcSet={`${S3}/grid/${artistData.filename}.jpg 300w`}
            sizes="(max-width: 600px) calc(50vw - 24px), (max-width: 960px) calc(33vw - 20px), (max-width: 1280px) calc(25vw - 24px), 260px"
            loading={eager ? 'eager' : 'lazy'}
            fetchpriority={eager ? 'high' : undefined}
            decoding="async"
            width="300"
            height="300"
          />
        </Box>
        <Typography sx={artistGridStyles.text} className="artist-name">
          {artistData.name}
          {artistData.alternate_names && (
            <Typography
              component="span"
              sx={{ fontSize: '0.75em', fontWeight: 400, color: 'text.secondary', ml: 0.5 }}
            >
              ({artistData.alternate_names})
            </Typography>
          )}
        </Typography>
      </Link>
    </Box>
  );
};

export default ArtistGridItem;
