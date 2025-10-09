import {
  Box,
  TextField,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries";
import ArtistGridItem from "./ArtistGridItem";
import { ChangeEvent, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { SelectChangeEvent } from '@mui/material/Select'; // Import SelectChangeEvent

interface Artist {
  name: string;
  filename: string;
  location?: string;
  doesSigning?: boolean;
  markssignatureservice?: string;
  mountainmage?: string;
}

const Homepage = () => {
  document.title = "MtG Artist Connection";
  const { data, error, loading } = useQuery(GET_ARTISTS_FOR_HOMEPAGE);
  const [userSearch, setUserSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [mountainMageFilter, setMountainMageFilter] = useState(false);
  const [marksSigServiceFilter, setMarksSigServiceFilter] = useState(false);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUserSearch(event.target.value);
  };

  const handleLocationChange = (event: SelectChangeEvent) => {
    setLocationFilter(event.target.value);
  };

  const handleMountainMageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMountainMageFilter(event.target.checked);
  };

  const handleMarksSigServiceChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMarksSigServiceFilter(event.target.checked);
  };

  const locations = useMemo(() => {
      if (!data?.artists) return { US: [], Other: [] };

    const usStates = [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
      "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
      "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
      "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
      "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
      "New Hampshire", "New Jersey", "New Mexico", "New York",
      "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
      "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
      "West Virginia", "Wisconsin", "Wyoming"
    ];

    const usLocations: string[] = [];
    const otherLocations: string[] = [];

    data.artists.forEach((artist: Artist) => {
      if (artist.location) {
        if (artist.location.endsWith(', US') && usStates.includes(artist.location.split(',')[0])) {
            usLocations.push(artist.location);
        } else {
          otherLocations.push(artist.location);
        }
      }
    });

    const uniqueUsLocations = Array.from(new Set(usLocations)).sort();
    const uniqueOtherLocations = Array.from(new Set(otherLocations)).sort();

    return {
      US: uniqueUsLocations,
      Other: uniqueOtherLocations,
    };
  }, [data]);

    const filteredData = useMemo(() => {
    let filteredArtists = data?.artists || [];

    // Location Filter
    if (locationFilter) {
        filteredArtists = filteredArtists.filter((artist: Artist) => {
            if (locationFilter === 'US') {
                return artist.location?.endsWith(', US');
            } else {
                return artist.location === locationFilter;
            }
        });
    }

    // Mountain Mage Filter
    if (mountainMageFilter) {
      filteredArtists = filteredArtists.filter(
        (artist: Artist) => artist.mountainmage && artist.mountainmage !== "" && artist.mountainmage !== "false"
      );
    }

    // Marks Signature Service Filter
    if (marksSigServiceFilter) {
      filteredArtists = filteredArtists.filter(
        (artist: Artist) => artist.markssignatureservice === "true"
      );
    }

    // Search Filter
    if (userSearch.length >= 2) {
      const searchTerm = userSearch.toLowerCase().replace(/\s/g, "");
      filteredArtists = filteredArtists.filter((artist: Artist) => {
        const artistInfo = `${artist.name}${artist.filename}${
          artist.location || ""
        }`
          .toLowerCase()
          .replace(/\s/g, "");
        return artistInfo.includes(searchTerm);
      });
    }

    return filteredArtists;
  }, [
    userSearch,
    data,
    locationFilter,
    mountainMageFilter,
    marksSigServiceFilter,
  ]);

  const styles = {
    container: {
      background: "linear-gradient(135deg, #507A60 0%, #3c5c48 50%, #2d4a36 100%)",
      minHeight: "100vh",
      padding: { xs: 3, md: 6 },
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
        pointerEvents: "none",
      },
    },
    wrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 2, md: 3 },
      background: "rgba(255, 255, 255, 0.98)",
      backdropFilter: "blur(30px) saturate(1.2)",
      borderRadius: 4,
      boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 16px 40px rgba(80, 122, 96, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      position: "relative",
      zIndex: 1,
    },
    headerText: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 800,
      fontSize: { xs: "2.2rem", md: "3.2rem" },
      marginBottom: 3,
      textAlign: "center",
      letterSpacing: "-0.02em",
      lineHeight: 1,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      position: "relative",
      "&::after": {
        content: '""',
        position: "absolute",
        bottom: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "100px",
        height: "3px",
        background: "linear-gradient(90deg, transparent, #507A60, transparent)",
        borderRadius: "2px",
      },
    },
    description: {
      fontSize: "1.1rem",
      color: "#2d3748",
      lineHeight: 1.7,
      marginBottom: 2.5,
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      fontWeight: 400,
    },
    count: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      color: "white",
      fontSize: "1.3rem",
      fontWeight: 700,
      marginTop: 3,
      marginBottom: 4,
      display: "block",
      padding: "16px 32px",
      borderRadius: 3,
      textAlign: "center",
      width: "fit-content",
      margin: "3rem auto",
      boxShadow: "0 12px 32px rgba(80, 122, 96, 0.25), 0 4px 12px rgba(80, 122, 96, 0.15)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "0.5px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 16px 40px rgba(80, 122, 96, 0.3), 0 6px 16px rgba(80, 122, 96, 0.2)",
      },
    },
    searchContainer: {
      background: "rgba(255, 255, 255, 0.9)",
      backdropFilter: "blur(20px) saturate(1.1)",
      borderRadius: 3,
      padding: 3,
      boxShadow: "0 12px 32px rgba(0,0,0,0.06), 0 6px 16px rgba(80, 122, 96, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 4,
      gap: { xs: 2, md: 3 },
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.08), 0 8px 20px rgba(80, 122, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
      },
    },
    textField: {
      width: { xs: "100%", md: "40%" },
      "& .MuiOutlinedInput-root": {
        borderRadius: 3,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.95)",
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
        "&:hover fieldset": {
          borderColor: "#507A60",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#507A60",
          borderWidth: "2px",
        },
      },
      "& .MuiInputLabel-root": {
        "&.Mui-focused": {
          color: "#507A60",
        },
      },
    },
    locationSelect: {
      width: { xs: "100%", md: "30%" },
      "& .MuiOutlinedInput-root": {
        borderRadius: 3,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease",
        "&:hover": {
          background: "rgba(255, 255, 255, 0.95)",
          transform: "translateY(-1px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#507A60",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#507A60",
          borderWidth: "2px",
        },
      },
      "& .MuiInputLabel-root": {
        "&.Mui-focused": {
          color: "#507A60",
        },
      },
    },
    checkboxContainer: {
      background: "rgba(255, 255, 255, 0.7)",
      borderRadius: 2,
      padding: 2,
      border: "1px solid rgba(255, 255, 255, 0.5)",
      transition: "all 0.3s ease",
      "&:hover": {
        background: "rgba(255, 255, 255, 0.9)",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
    checkboxesContainer: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      gap: 1,
    },
    signingAgentLabel: {
      background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: 700,
      fontSize: "1.1rem",
      marginBottom: 1,
      textAlign: "center",
      fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
      letterSpacing: "-0.01em",
    },
    artistsGrid: {
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
      gap: 3,
      marginTop: 4,
    },
    loadingContainer: {
      background: "linear-gradient(135deg, #507A60 0%, #3c5c48 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      position: "relative",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
      },
    },
    errorMessage: {
      color: "#d32f2f",
      textAlign: "center",
      padding: 4,
      background: "linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, rgba(211, 47, 47, 0.12) 100%)",
      borderRadius: 3,
      border: "1px solid rgba(211, 47, 47, 0.2)",
      backdropFilter: "blur(10px)",
      fontSize: "1.1rem",
      fontWeight: 500,
    },
    noResults: {
      textAlign: "center",
      padding: 4,
      color: "#2d3748",
      fontSize: "1.1rem",
      fontWeight: 500,
      background: "rgba(255, 255, 255, 0.8)",
      borderRadius: 2,
      backdropFilter: "blur(10px)",
    },
  };

  if (loading)
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress size={60} sx={{ color: "white", zIndex: 1 }} />
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

        <Typography variant="h6" sx={styles.description}>
          Looking for your favorite Magic artist's website, social links, or online store? You’re in the right place! MTG Artist Connection is your go-to hub for discovering:
        </Typography>
        <Typography variant="body1" sx={styles.description}>
          <b>Artist Profiles</b> – Find official sites, social media pages, and portfolios for hundreds of MTG artists.
        </Typography>
        <Typography variant="body1" sx={styles.description}>
          <b>Where to Buy</b> – Easily locate artist stores for playmats, prints, tokens, and signed cards.
        </Typography>
        <Typography variant="body1" sx={styles.description}>
          <b>Upcoming Events</b> – See which conventions, signings, or streams your favorite artists will be attending.
        </Typography>
        <Typography variant="h6" sx={styles.description}>
          Whether you're hunting for a signature, commissioning custom art, or just exploring the incredible talent behind the cards, this is your gateway to the MTG art community.
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

          <FormControl sx={styles.locationSelect}>
            <InputLabel id="location-select-label">Filter by Location</InputLabel>
            <Select
              labelId="location-select-label"
              id="location-select"
              value={locationFilter}
              label="Filter by Location"
              onChange={handleLocationChange}
            >
              <MenuItem value="">All Locations</MenuItem>
              <MenuItem value="US">
                <em>US States</em>
              </MenuItem>
              {locations.US.map((location) => (
                <MenuItem key={location} value={location}>
                  {location.split(',')[0]}
                </MenuItem>
              ))}
               <MenuItem value="Other" disabled>
                <em>Other Locations</em>
              </MenuItem>
              {locations.Other.map((location) => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={styles.checkboxContainer}>
           <Typography sx={styles.signingAgentLabel}>Signing Agent</Typography>
            <FormGroup sx={styles.checkboxesContainer}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={marksSigServiceFilter}
                    onChange={handleMarksSigServiceChange}
                    name="marksSigService"
                    sx={{
                      color: "#507A60",
                      "&.Mui-checked": {
                        color: "#507A60",
                      },
                    }}
                  />
                }
                label="Marks Signature Service"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={mountainMageFilter}
                    onChange={handleMountainMageChange}
                    name="mountainMage"
                    sx={{
                      color: "#507A60",
                      "&.Mui-checked": {
                        color: "#507A60",
                      },
                    }}
                  />
                }
                label="Mountain Mage"
              />
            </FormGroup>
          </Box>
        </Box>

        <Box sx={styles.artistsGrid}>
          {filteredData.length > 0 ? (
            filteredData.map((artist: Artist) => (
              <ArtistGridItem artistData={artist} key={artist.name} />
            ))
          ) : (userSearch.length >= 2 ||
            locationFilter !== "" ||
            mountainMageFilter ||
            marksSigServiceFilter) && filteredData.length === 0 ? (
            <Typography sx={styles.noResults}>
              No artists found matching your search.
            </Typography>
          ) : null
        }
        </Box>
      </Box>
    </Box>
  );
};

export default Homepage;
