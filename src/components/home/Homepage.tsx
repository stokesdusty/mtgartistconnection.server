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
        (artist: Artist) => artist.mountainmage !== ""
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
      backgroundColor: "#507A60",
      minHeight: "100vh",
      padding: { xs: 2, md: 4 },
    },
    wrapper: {
      maxWidth: 1200,
      margin: "0 auto",
      padding: { xs: 3, md: 5 },
      backgroundColor: "#fff",
      borderRadius: 2,
      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
    headerText: {
      color: "#507A60",
      fontWeight: 700,
      fontSize: { xs: "2rem", md: "3rem" },
      marginBottom: 3,
      textAlign: { xs: "center", md: "left" },
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
      flexDirection: { xs: "column", md: "row" }, // Stack on small screens
      justifyContent: "center",
      alignItems: "center", // Vertically center items
      marginBottom: 4,
      width: "100%",
      gap: { xs: 2, md: 2 },
    },
    textField: {
      width: { xs: "100%", md: "40%" },
      marginBottom: { xs: 2, md: 0 }, // Add some spacing on smaller screens
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
    locationSelect: {
      width: { xs: "100%", md: "30%" },
      marginBottom: { xs: 2, md: 0 }, // Add some spacing on smaller screens
    },
    checkboxesContainer: {
      display: "flex",
      flexDirection: { xs: "column", md: "row" }, // Stack on small screens
      gap: 1,
      marginBottom: { xs: 2, md: 0 }, // Add some spacing on smaller screens
    },
    artistsGrid: {
      display: "grid",
      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
      gap: 3,
      marginTop: 4,
    },
    loadingContainer: {
      backgroundColor: "#507A60",
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

          <FormGroup sx={styles.checkboxesContainer}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={mountainMageFilter}
                  onChange={handleMountainMageChange}
                  name="mountainMage"
                />
              }
              label="Mountain Mage"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={marksSigServiceFilter}
                  onChange={handleMarksSigServiceChange}
                  name="marksSigService"
                />
              }
              label="Marks Signature Service"
            />
          </FormGroup>
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
