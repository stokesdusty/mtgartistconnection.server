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
  Button,
} from "@mui/material";
import { useQuery } from "@apollo/client";
import { GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries";
import ArtistGridItem from "./ArtistGridItem";
import { ChangeEvent, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { SelectChangeEvent } from '@mui/material/Select';
import { homepageStyles } from "../../styles/homepage-styles";
import { useNavigate } from "react-router-dom";
import ShuffleIcon from "@mui/icons-material/Shuffle";

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
  const navigate = useNavigate();

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

  const handleRandomArtist = () => {
    if (data?.artists && data.artists.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.artists.length);
      const randomArtist = data.artists[randomIndex];
      navigate(`/artist/${randomArtist.name}`);
    }
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

  if (loading)
    return (
      <Box sx={homepageStyles.loadingContainer}>
        <CircularProgress size={60} sx={homepageStyles.loadingSpinner} />
      </Box>
    );

  if (error)
    return (
      <Box sx={homepageStyles.container}>
        <Box sx={homepageStyles.wrapper}>
          <Typography variant="h5" sx={homepageStyles.errorMessage}>
            Error loading artists. Please try again later.
          </Typography>
        </Box>
      </Box>
    );

  if (!data?.artists)
    return (
      <Box sx={homepageStyles.container}>
        <Box sx={homepageStyles.wrapper}>
          <Typography variant="h5" sx={homepageStyles.noResults}>
            No artists found
          </Typography>
        </Box>
      </Box>
    );

  return (
    <Box sx={homepageStyles.container}>
      <Box sx={homepageStyles.wrapper}>
        <Box sx={homepageStyles.headerSection}>
          <Typography variant="h1" sx={homepageStyles.headerText}>
            MTG Artist Connection
          </Typography>

          <Typography variant="h6" sx={homepageStyles.description}>
            Your go-to hub for discovering Magic: The Gathering artists
          </Typography>

          <Typography variant="body1" sx={homepageStyles.descriptionList}>
            <b>Artist Profiles</b> – Find official sites, social media pages, and portfolios for hundreds of MTG artists.
          </Typography>
          <Typography variant="body1" sx={homepageStyles.descriptionList}>
            <b>Where to Buy</b> – Easily locate artist stores for playmats, prints, tokens, and signed cards.
          </Typography>
          <Typography variant="body1" sx={homepageStyles.descriptionList}>
            <b>Upcoming Events</b> – See which conventions, signings, or streams your favorite artists will be attending.
          </Typography>

          <Box component="span" sx={homepageStyles.count}>
            {data.artists.length} artists and counting
          </Box>
        </Box>

        <Box sx={homepageStyles.filtersSection}>
          <Box sx={homepageStyles.filtersGrid}>
            <Box sx={homepageStyles.searchContainer}>
              <TextField
                sx={homepageStyles.textField}
                value={userSearch}
                placeholder="Search for an artist"
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={handleRandomArtist}
                startIcon={<ShuffleIcon />}
                sx={homepageStyles.randomButton}
              >
                Random Artist
              </Button>
            </Box>

            <FormControl sx={homepageStyles.locationSelect}>
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

            <Box sx={homepageStyles.checkboxContainer}>
              <Typography sx={homepageStyles.signingAgentLabel}>Signing Agent</Typography>
              <FormGroup sx={homepageStyles.checkboxesContainer}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={marksSigServiceFilter}
                      onChange={handleMarksSigServiceChange}
                      name="marksSigService"
                      sx={homepageStyles.checkbox}
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
                      sx={homepageStyles.checkbox}
                    />
                  }
                  label="Mountain Mage"
                />
              </FormGroup>
            </Box>
          </Box>
        </Box>

        <Box sx={homepageStyles.artistsGrid}>
          {filteredData.length > 0 ? (
            filteredData.map((artist: Artist) => (
              <ArtistGridItem artistData={artist} key={artist.name} />
            ))
          ) : (userSearch.length >= 2 ||
            locationFilter !== "" ||
            mountainMageFilter ||
            marksSigServiceFilter) && filteredData.length === 0 ? (
            <Typography sx={homepageStyles.noResults}>
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
