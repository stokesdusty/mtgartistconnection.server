import { Box, TextField, Typography, CircularProgress } from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries";
import ArtistGridItem from "./ArtistGridItem";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

interface Artist {
  name: string;
  filename: string;
}

const Homepage = () => {
  document.title = "MtG Artist Connection";
  const { data, error, loading } = useQuery(GET_ARTISTS_FOR_HOMEPAGE);
  const [userSearch, setUserSearch] = useState("");

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserSearch(event.target.value);
  };

  const filteredData = useMemo(() => {
    if (!data?.artists || userSearch.length < 2) {
      return data?.artists || [];
    }

    const searchTerm = userSearch.toLowerCase().replace(/\s/g, "");

    return data.artists.filter((artist: Artist) =>
      artist.filename.includes(searchTerm)
    );
  }, [userSearch, data]);

  useEffect(() => {
    if (!userSearch) return;
  }, [userSearch]);

  // Modernized styles with #507A60 as primary color
  const styles = {
    container: {
      backgroundColor: "#507A60",
      minHeight: "100vh",
      padding: { xs: 2, md: 4 },
    },
    wrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 4 },
      backgroundColor: "#fff",
      borderRadius: 2,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
    headerText: {
      color: "#507A60",
      fontWeight: 700,
      fontSize: { xs: "2rem", md: "3rem" },
      marginBottom: 2,
      textAlign: "center",
      paddingTop: 4,
    },
    description: {
      fontSize: "1.1rem",
      color: "#555",
      lineHeight: 1.6,
      marginBottom: 3,
    },
    count: {
      color: "#507A60",
      fontSize: "1.2rem",
      fontWeight: 600,
      marginTop: 2,
      marginBottom: 3,
      display: "block",
      padding: "8px 16px",
      backgroundColor: "rgba(80, 122, 96, 0.1)",
      borderRadius: 2,
      textAlign: "center",
      width: "fit-content",
      margin: "2rem auto",
    },
    searchContainer: {
      display: "flex",
      justifyContent: "center",
      marginBottom: 4,
      width: "100%",
    },
    textField: {
      width: { xs: "100%", md: "70%" },
      marginBottom: 4,
      "& .MuiOutlinedInput-root": {
        borderRadius: 4,
        "&:hover fieldset": {
          borderColor: "#507A60",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#507A60",
        },
      },
    },
    artistsGrid: {
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
      gap: 3,
      marginTop: 4,
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "50vh",
    },
    errorMessage: {
      color: "#d32f2f",
      textAlign: "center",
      padding: 4,
      backgroundColor: "rgba(211, 47, 47, 0.1)",
      borderRadius: 2,
    },
    noResults: {
      textAlign: "center",
      padding: 4,
      color: "#666",
    },
  };

  if (loading)
    return (
      <Box sx={styles.container}>
        <Box sx={styles.loadingContainer}>
          <CircularProgress sx={{ color: "#507A60" }} />
        </Box>
      </Box>
    );

  if (error)
    return (
      <Box sx={styles.container}>
        <Box sx={styles.wrapper}>
          <Typography variant="h5" sx={styles.errorMessage}>
            Error loading artists. Please try again later.
          </Typography>
        </Box>
      </Box>
    );

  if (!data?.artists)
    return (
      <Box sx={styles.container}>
        <Box sx={styles.wrapper}>
          <Typography variant="h5" sx={styles.noResults}>
            No artists found
          </Typography>
        </Box>
      </Box>
    );

  return (
    <Box sx={styles.container}>
      <Box sx={styles.wrapper}>
        <Typography variant="h1" sx={styles.headerText}>
          Welcome to MTG Artist Connection
        </Typography>
        <Typography sx={styles.description}>
          We all love and appreciate the art in our favorite card game. Finding
          the artists to get cards signed, view their other work, and following
          their socials shouldn't be as tough as it is. So we created MTG Artist
          Connection, a place where we aspire to collect as much useful data to
          help fans connect with the art in a whole new way.
        </Typography>
        <Typography sx={styles.count}>
          {data.artists.length} artists and counting!
        </Typography>
        
        <Box sx={styles.searchContainer}>
          <TextField
            sx={styles.textField}
            value={userSearch}
            placeholder="Search for an artist"
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#507A60" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box sx={styles.artistsGrid}>
          {filteredData.length > 0 ? (
            filteredData.map((artist: Artist) => (
              <ArtistGridItem artistData={artist} key={artist.name} />
            ))
          ) : userSearch.length >= 2 ? (
            <Typography sx={styles.noResults}>
              No artists found matching your search.
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default Homepage;