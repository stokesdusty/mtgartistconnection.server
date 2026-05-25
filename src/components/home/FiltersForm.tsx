import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Button,
  ListSubheader,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import InputAdornment from "@mui/material/InputAdornment";
import { SelectChangeEvent } from "@mui/material/Select";
import { MagnifyingGlass, Shuffle } from "@phosphor-icons/react";
import { ChangeEvent } from "react";
import { homepageStyles } from "../../styles/homepage-styles";
import { themeColors } from "../../styles/design-tokens";

export interface ScryfallSet {
  code: string;
  name: string;
  set_type: string;
  released_at: string;
}

interface FiltersFormProps {
  idSuffix: string;
  layout?: "grid" | "stack";
  userSearch: string;
  locationFilter: string;
  setFilter: string;
  locations: { US: string[]; Other: string[] };
  scryfallSets: ScryfallSet[];
  setsLoading: boolean;
  marksSigServiceFilter: boolean;
  mountainMageFilter: boolean;
  hasUpcomingEventFilter: boolean;
  sellsApsFilter: boolean;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onLocationChange: (e: SelectChangeEvent) => void;
  onSetChange: (code: string) => void;
  onMarksSigServiceChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onMountainMageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onHasUpcomingEventChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSellsApsChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRandomArtist?: () => void;
}

const FiltersForm = ({
  idSuffix,
  layout = "stack",
  userSearch,
  locationFilter,
  setFilter,
  locations,
  scryfallSets,
  setsLoading,
  marksSigServiceFilter,
  mountainMageFilter,
  hasUpcomingEventFilter,
  sellsApsFilter,
  onSearchChange,
  onLocationChange,
  onSetChange,
  onMarksSigServiceChange,
  onMountainMageChange,
  onHasUpcomingEventChange,
  onSellsApsChange,
  onRandomArtist,
}: FiltersFormProps) => {
  const locationLabelId = `location-select-label${idSuffix}`;
  const locationSelectId = `location-select${idSuffix}`;

  const searchField = (
    <TextField
      size="small"
      sx={{ ...homepageStyles.textField, "& .MuiInputBase-input": { fontSize: "0.875rem" } }}
      value={userSearch}
      placeholder="Search for an artist"
      onChange={onSearchChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <MagnifyingGlass size={20} />
          </InputAdornment>
        ),
      }}
    />
  );

  const locationSelect = (
    <FormControl
      size="small"
      sx={{ ...homepageStyles.locationSelect, "& .MuiInputLabel-root": { fontSize: "0.875rem" } }}
    >
      <InputLabel
        id={locationLabelId}
        sx={{ color: themeColors.text.secondary, "&.Mui-focused": { color: themeColors.primary.main } }}
      >
        Filter by Location
      </InputLabel>
      <Select
        labelId={locationLabelId}
        id={locationSelectId}
        value={locationFilter}
        label="Filter by Location"
        onChange={onLocationChange}
        sx={{ fontSize: "0.875rem" }}
      >
        <MenuItem value="">All Locations</MenuItem>
        {locations.US.length > 0 && [
          <ListSubheader key="us-header" sx={homepageStyles.listSubheader}>
            US States
          </ListSubheader>,
          <MenuItem key="us-all" value="US" sx={{ pl: 3 }}>
            Anywhere in the US
          </MenuItem>,
          ...locations.US.map((location) => (
            <MenuItem key={location} value={location} sx={{ pl: 3 }}>
              {location.split(",")[0]}
            </MenuItem>
          )),
        ]}
        {locations.Other.length > 0 && [
          <ListSubheader key="other-header" sx={homepageStyles.listSubheader}>
            Other Locations
          </ListSubheader>,
          ...locations.Other.map((location) => (
            <MenuItem key={location} value={location} sx={{ pl: 3 }}>
              {location}
            </MenuItem>
          )),
        ]}
      </Select>
    </FormControl>
  );

  const setAutocomplete = (
    <Autocomplete
      size="small"
      options={scryfallSets}
      getOptionLabel={(option) => option.name}
      value={scryfallSets.find((s) => s.code === setFilter) ?? null}
      onChange={(_, newValue) => onSetChange(newValue?.code ?? "")}
      loading={setsLoading}
      loadingText="Loading sets..."
      noOptionsText="No sets found"
      sx={homepageStyles.locationSelect}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Filter by Set"
          size="small"
          sx={{
            "& .MuiInputLabel-root": { fontSize: "0.875rem" },
            "& .MuiInputBase-input": { fontSize: "0.875rem" },
          }}
        />
      )}
    />
  );

  const checkboxGroup = (
    <Box sx={homepageStyles.checkboxContainer}>
      <Typography sx={{ ...homepageStyles.signingAgentLabel, fontSize: "0.875rem", mb: 0.5 }}>
        Filters
      </Typography>
      <FormGroup sx={{ ...homepageStyles.checkboxesContainer, gap: 0 }}>
        <FormControlLabel
          sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" }, my: -0.25 }}
          control={
            <Checkbox
              size="small"
              checked={marksSigServiceFilter}
              onChange={onMarksSigServiceChange}
              name={`marksSigService${idSuffix}`}
              sx={{ ...homepageStyles.checkbox, p: 0.5 }}
            />
          }
          label="Marks Signature Service"
        />
        <FormControlLabel
          sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" }, my: -0.25 }}
          control={
            <Checkbox
              size="small"
              checked={mountainMageFilter}
              onChange={onMountainMageChange}
              name={`mountainMage${idSuffix}`}
              sx={{ ...homepageStyles.checkbox, p: 0.5 }}
            />
          }
          label="Mountain Mage Signing Service"
        />
        <FormControlLabel
          sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" }, my: -0.25 }}
          control={
            <Checkbox
              size="small"
              checked={hasUpcomingEventFilter}
              onChange={onHasUpcomingEventChange}
              name={`hasUpcomingEvent${idSuffix}`}
              sx={{ ...homepageStyles.checkbox, p: 0.5 }}
            />
          }
          label="Has Upcoming Event"
        />
        <FormControlLabel
          sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" }, my: -0.25 }}
          control={
            <Checkbox
              size="small"
              checked={sellsApsFilter}
              onChange={onSellsApsChange}
              name={`sellsAps${idSuffix}`}
              sx={{ ...homepageStyles.checkbox, p: 0.5 }}
            />
          }
          label="Sells APs on Website"
        />
      </FormGroup>
    </Box>
  );

  if (layout === "grid") {
    return (
      <Box sx={{ ...homepageStyles.filtersGrid, gap: 2 }}>
        <Box sx={homepageStyles.searchContainer}>
          {searchField}
          <Button
            variant="contained"
            onClick={onRandomArtist}
            startIcon={<Shuffle size={20} />}
            sx={{ ...homepageStyles.randomButton, fontSize: "0.8125rem", height: '40px' }}
          >
            Random Artist
          </Button>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {locationSelect}
          {setAutocomplete}
        </Box>
        {checkboxGroup}
      </Box>
    );
  }

  return (
    <>
      {searchField}
      {locationSelect}
      {setAutocomplete}
      {checkboxGroup}
    </>
  );
};

export default FiltersForm;
