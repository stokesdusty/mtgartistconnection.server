import { Box } from "@mui/system";
import { artistGridStyles, gridHtmlElementStyles } from "../../styles/artist-grid-styles";
import { Link, Typography } from "@mui/material";

const ArtistGridItem = ({ artistData, eager }: { artistData: any; eager?: boolean }) => {
    return (
      <Box sx={artistGridStyles.container}>
        <Link sx={artistGridStyles.link} href={`/artist/${artistData.name}`}>
          <Box sx={artistGridStyles.imageBox} className="artist-image-box">
            <img
              alt={artistData.name}
              style={gridHtmlElementStyles.img}
              src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/grid/${artistData.filename}.jpg`}
              loading={eager ? "eager" : "lazy"}
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
                sx={{
                  fontSize: '0.75em',
                  fontWeight: 400,
                  color: 'text.secondary',
                  ml: 0.5,
                }}
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
