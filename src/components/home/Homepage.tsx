import { Box, LinearProgress, TextField, Typography } from "@mui/material";
import { homepageStyles } from "../../styles/homepage-styles";
import { useQuery } from "@apollo/client";
import { GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries"; // Corrected type
import ArtistGridItem from "./ArtistGridItem";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

interface Artist {
  name: string;
  filename: string;
  // ... other properties
}

const Homepage = () => {
  document.title = "MtG Artist Connection";
  const { data, error, loading } = useQuery(
    GET_ARTISTS_FOR_HOMEPAGE
  );
  const [userSearch, setUserSearch] = useState("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserSearch(event.target.value);
  };

  const filteredData = useMemo(() => {
    if (!data?.artists || userSearch.length < 2) {
      return data?.artists || [];
    }

    const searchTerm = userSearch.toLowerCase().replace(/\s/g, ""); // Remove spaces

    return data.artists.filter((artist: Artist) =>
      artist.filename.includes(searchTerm)
    );
  }, [userSearch, data]);

  useEffect(() => {
    if (!userSearch) return;
  },[userSearch])

  if (loading)
    return (
      <Box sx={homepageStyles.container}>
        <LinearProgress />
      </Box>
    );
  if (error) return <p>Error loading artists</p>;
  if (!data?.artists) return <p>No artists found</p>;

  return (
    <Box sx={homepageStyles.container}>
      <Box sx={homepageStyles.wrapper}>
        <Typography variant="h1" sx={homepageStyles.headerText}>
          Welcome to MTG Artist Connection
        </Typography>
        <Typography>
          We all love and appreciate the art in our favorite card game. Finding
          the artists to get cards signed, view their other work, and following
          their socials shouldn't be as tough as it is. So we created MTG Artist
          Connection, a place where we aspire to collect as much useful data to
          help fans connect with the art in a whole new way.
        </Typography>
        <Typography sx={homepageStyles.count}>
          {data.artists.length} artists and counting!
        </Typography>
        <br />
        <TextField
          sx={homepageStyles.textField}
          value={userSearch}
          placeholder="Search for artist"
          onChange={handleSearchChange}
          InputProps={{
            style: {
              width: "80%",
              borderRadius: "20px",
              fontFamily: "Work Sans",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: "#fff",
            },
          }}
        />
        {filteredData.length > 0 &&
          filteredData.map((artist: Artist) => (
            <ArtistGridItem artistData={artist} key={artist.name} />
          ))}
      </Box>
    </Box>
  );
};

export default Homepage;
