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
          </Typography>
        </Link>
      </Box>
    );
};

export default ArtistGridItem;
