import { Box } from "@mui/system";
import { artistGridStyles, gridHtmlElementStyles } from "../../styles/artist-grid-styles";
import { Link, Typography } from "@mui/material";

const ArtistGridItem = (ArtistGridProps: any) => {
    return (
      <Box sx={artistGridStyles.container}>
        <Link sx={artistGridStyles.link} href={`/artist/${ArtistGridProps.artistData.name}`}>
          <Box sx={artistGridStyles.imageBox} className="artist-image-box">
            <img
              alt={ArtistGridProps.artistData.name}
              style={gridHtmlElementStyles.img}
              src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/grid/${ArtistGridProps.artistData.filename}.jpg`}
              loading="lazy"
            />
          </Box>
          <Typography sx={artistGridStyles.text} className="artist-name">
            {ArtistGridProps.artistData.name}
            {ArtistGridProps.artistData.alternate_names && (
              <Typography
                component="span"
                sx={{
                  fontSize: '0.75em',
                  fontWeight: 400,
                  color: '#757575',
                  ml: 0.5,
                }}
              >
                ({ArtistGridProps.artistData.alternate_names})
              </Typography>
            )}
          </Typography>
        </Link>
      </Box>
    );
};

export default ArtistGridItem;
