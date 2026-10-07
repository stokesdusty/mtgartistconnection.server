import { useState, MouseEvent } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  ListSubheader,
  Menu,
  Popover,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import FilterChip from "../shared/FilterChip";
import MonoLabel from "../shared/MonoLabel";
import { homepageStyles } from "../../styles/homepage-styles";

export interface ScryfallSet {
  code: string;
  name: string;
  set_type: string;
  released_at: string;
}

export type Locations = { US: string[]; Other: string[] };

/** The boolean filters, keyed by their URL param. */
export type ToggleKey = 'hasEvent' | 'sellsAps' | 'marksSig' | 'mountainMage';

export const TOGGLE_FILTERS: { key: ToggleKey; label: string; live?: boolean }[] = [
  { key: 'hasEvent', label: 'Signing soon', live: true },
  { key: 'sellsAps', label: 'Sells APs' },
  { key: 'marksSig', label: 'Marks Signature Service' },
  { key: 'mountainMage', label: 'Mountain Mage' },
];

export const locationLabel = (value: string) =>
  value === 'US' ? 'Anywhere in the US' : value.split(',')[0];

// ─── Location ────────────────────────────────────────────────────────────────

/** Shared option list: All, US states (+ "Anywhere in the US"), then other locations. */
const locationOptions = (
  locations: Locations,
  selected: string,
  onPick?: (value: string) => void,
) => {
  const item = (value: string, label: string, indent = true) => (
    <MenuItem
      key={value || 'all'}
      value={value}
      selected={onPick ? selected === value : undefined}
      onClick={onPick ? () => onPick(value) : undefined}
      sx={{ ...(homepageStyles.menuItem as object), pl: indent ? 3 : 1.5 }}
    >
      {label}
    </MenuItem>
  );
  return [
    item('', 'All locations', false),
    ...(locations.US.length > 0
      ? [
          <ListSubheader key="us-header" sx={homepageStyles.listSubheader}>US States</ListSubheader>,
          item('US', 'Anywhere in the US'),
          ...locations.US.map((l) => item(l, l.split(',')[0])),
        ]
      : []),
    ...(locations.Other.length > 0
      ? [
          <ListSubheader key="other-header" sx={homepageStyles.listSubheader}>Other Locations</ListSubheader>,
          ...locations.Other.map((l) => item(l, l)),
        ]
      : []),
  ];
};

/** "Location ▾" chip that opens the grouped location menu. */
export const LocationChip = ({
  locations,
  value,
  onChange,
}: {
  locations: Locations;
  value: string;
  onChange: (value: string) => void;
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <FilterChip
        dropdown
        active={Boolean(value)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget)}
      >
        {value ? locationLabel(value) : 'Location'}
      </FilterChip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        sx={homepageStyles.menu}
      >
        {locationOptions(locations, value, (v) => {
          onChange(v);
          setAnchor(null);
        })}
      </Menu>
    </>
  );
};

// ─── Set ─────────────────────────────────────────────────────────────────────

const SetAutocomplete = ({
  scryfallSets,
  setsLoading,
  value,
  onChange,
  autoFocus,
}: {
  scryfallSets: ScryfallSet[];
  setsLoading: boolean;
  value: string;
  onChange: (code: string) => void;
  autoFocus?: boolean;
}) => (
  <Autocomplete
    size="small"
    options={scryfallSets}
    getOptionLabel={(option) => option.name}
    value={scryfallSets.find((s) => s.code === value) ?? null}
    onChange={(_, newValue) => onChange(newValue?.code ?? "")}
    loading={setsLoading}
    loadingText="Loading sets..."
    noOptionsText="No sets found"
    openOnFocus
    sx={homepageStyles.field}
    renderInput={(params) => (
      <TextField {...params} placeholder="Any set" aria-label="Filter by set" autoFocus={autoFocus} />
    )}
  />
);

/** "Set ▾" chip that opens a searchable set picker. */
export const SetChip = ({
  scryfallSets,
  setsLoading,
  value,
  onChange,
}: {
  scryfallSets: ScryfallSet[];
  setsLoading: boolean;
  value: string;
  onChange: (code: string) => void;
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const selected = scryfallSets.find((s) => s.code === value);
  return (
    <>
      <FilterChip
        dropdown
        active={Boolean(value)}
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchor)}
        onClick={(e: MouseEvent<HTMLButtonElement>) => setAnchor(e.currentTarget)}
      >
        {value ? selected?.name ?? value.toUpperCase() : 'Set'}
      </FilterChip>
      <Popover
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={homepageStyles.popover}
      >
        <SetAutocomplete
          autoFocus
          scryfallSets={scryfallSets}
          setsLoading={setsLoading}
          value={value}
          onChange={(code) => {
            onChange(code);
            setAnchor(null);
          }}
        />
      </Popover>
    </>
  );
};

// ─── Full form (mobile filter sheet) ─────────────────────────────────────────

interface FiltersFormProps {
  idSuffix: string;
  locationFilter: string;
  setFilter: string;
  locations: Locations;
  scryfallSets: ScryfallSet[];
  setsLoading: boolean;
  toggles: Record<ToggleKey, boolean>;
  onToggle: (key: ToggleKey, value: boolean) => void;
  onLocationChange: (value: string) => void;
  onSetChange: (code: string) => void;
}

const FiltersForm = ({
  idSuffix,
  locationFilter,
  setFilter,
  locations,
  scryfallSets,
  setsLoading,
  toggles,
  onToggle,
  onLocationChange,
  onSetChange,
}: FiltersFormProps) => {
  const locationLabelId = `location-select-label${idSuffix}`;

  return (
    <Box sx={homepageStyles.formStack}>
      <Box>
        <MonoLabel component="div" id={locationLabelId} sx={{ mb: 1 }}>Location</MonoLabel>
        <FormControl fullWidth size="small" sx={homepageStyles.field}>
          <Select
            labelId={locationLabelId}
            id={`location-select${idSuffix}`}
            value={locationFilter}
            displayEmpty
            onChange={(e) => onLocationChange(e.target.value)}
            renderValue={(v) => (v ? locationLabel(v) : 'All locations')}
            MenuProps={{ sx: homepageStyles.menu }}
          >
            {locationOptions(locations, locationFilter)}
          </Select>
        </FormControl>
      </Box>

      <Box>
        <MonoLabel component="div" sx={{ mb: 1 }}>Set</MonoLabel>
        <SetAutocomplete scryfallSets={scryfallSets} setsLoading={setsLoading} value={setFilter} onChange={onSetChange} />
      </Box>

      <Box>
        <MonoLabel component="div" sx={{ mb: 1 }}>Show only</MonoLabel>
        <Box sx={homepageStyles.chipWrap}>
          {TOGGLE_FILTERS.map(({ key, label, live }) => (
            <FilterChip key={key} active={toggles[key]} live={live} onClick={() => onToggle(key, !toggles[key])}>
              {label}
            </FilterChip>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default FiltersForm;
