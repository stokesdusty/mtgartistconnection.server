import {
  Box,
  Pagination,
  Autocomplete,
  TextField,
  Alert,
} from "@mui/material";
import { X, Plus } from "@phosphor-icons/react";
import { Link as RouterLink } from "react-router-dom";
import EmptyState from "../shared/EmptyState";
import { ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useMutation, useQuery } from "@apollo/client";
import { UNFOLLOW_ARTIST, FOLLOW_ARTIST, MONITOR_STATE, UNMONITOR_STATE } from "../graphql/mutations";
import { GET_CURRENT_USER, GET_ARTIST_NAMES } from "../graphql/queries";
import { followingStyles as styles } from "../../styles/following-styles";
import MonoLabel from "../shared/MonoLabel";
import SegmentedControl, { SegmentOption } from "../shared/SegmentedControl";
import { FollowingSkeleton } from "../shared/Skeletons";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

type FollowingTab = "artists" | "events";

const TAB_OPTIONS: SegmentOption<FollowingTab>[] = [
  { value: "artists", label: "Artists" },
  { value: "events", label: "Events" },
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const Following = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [activeTab, setActiveTab] = useState<FollowingTab>("artists");
  const [artistsPage, setArtistsPage] = useState(1);
  const artistsPerPage = 20;
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [stateSuccess, setStateSuccess] = useState("");
  const [stateError, setStateError] = useState("");
  const [selectedFollowArtist, setSelectedFollowArtist] = useState<string | null>(null);
  const [followSuccess, setFollowSuccess] = useState("");
  const [followError, setFollowError] = useState("");

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !isLoggedIn,
  });

  const { data: allArtistsData } = useQuery(GET_ARTIST_NAMES, {
    skip: !isLoggedIn,
  });

  const [unfollowArtist] = useMutation(UNFOLLOW_ARTIST);
  const [followArtist] = useMutation(FOLLOW_ARTIST);
  const [monitorState] = useMutation(MONITOR_STATE);
  const [unmonitorState] = useMutation(UNMONITOR_STATE);

  const handleUnfollow = async (artistName: string) => {
    try {
      await unfollowArtist({ variables: { artistName } });
      await refetch();
    } catch (error: any) {
      console.error("Failed to unfollow artist:", error);
    }
  };

  const handleFollowArtist = async () => {
    if (!selectedFollowArtist) return;

    setFollowError("");
    setFollowSuccess("");

    try {
      const { data } = await followArtist({ variables: { artistName: selectedFollowArtist } });
      if (data?.followArtist?.success) {
        setFollowSuccess(`Now following ${selectedFollowArtist}`);
        setSelectedFollowArtist(null);
        await refetch();
        setTimeout(() => setFollowSuccess(""), 3000);
      } else {
        setFollowError(data?.followArtist?.message || "Failed to follow artist");
      }
    } catch (error: any) {
      setFollowError(error.message || "Failed to follow artist");
    }
  };

  const handleAddState = async () => {
    if (!selectedState) return;

    setStateError("");
    setStateSuccess("");

    try {
      const { data } = await monitorState({ variables: { state: selectedState } });
      if (data?.monitorState?.success) {
        setStateSuccess(`Successfully added ${selectedState} to monitoring`);
        setSelectedState(null);
        await refetch();
        setTimeout(() => setStateSuccess(""), 3000);
      } else {
        setStateError(data?.monitorState?.message || "Failed to add state");
      }
    } catch (error: any) {
      setStateError(error.message || "Failed to add state");
    }
  };

  const handleRemoveState = async (state: string) => {
    try {
      await unmonitorState({ variables: { state } });
      await refetch();
    } catch (error: any) {
      console.error("Failed to remove state:", error);
    }
  };

  if (!isLoggedIn) {
    return (
      <Box sx={styles.page}>
        <Box sx={styles.inner}>
          <Box role="alert" sx={styles.statusPanel}>
            Error: You must be logged in to access this page
          </Box>
        </Box>
      </Box>
    );
  }

  if (userLoading) {
    return <FollowingSkeleton />;
  }

  const followedArtists: string[] = userData?.me?.followedArtists ?? [];
  const monitoredStates: string[] = userData?.me?.monitoredStates ?? [];

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>
        <Box sx={styles.hero}>
          <Box>
            <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
              {followedArtists.length} {followedArtists.length === 1 ? "artist" : "artists"} · {monitoredStates.length} {monitoredStates.length === 1 ? "state" : "states"}
            </MonoLabel>
            <Box component="h1" sx={styles.title}>
              Following
            </Box>
          </Box>
          <SegmentedControl
            options={TAB_OPTIONS}
            value={activeTab}
            onChange={setActiveTab}
            aria-label="Following section"
          />
        </Box>

        {activeTab === "artists" && (
          <Box component="section">
            <SectionHeader title="Followed artists" count={followedArtists.length} />

            {followSuccess && (
              <Alert severity="success" sx={[styles.alert, styles.alertSuccess]}>
                {followSuccess}
              </Alert>
            )}
            {followError && (
              <Alert severity="error" sx={styles.alert}>
                {followError}
              </Alert>
            )}

            <Box sx={styles.addRow}>
              <Autocomplete
                options={(allArtistsData?.artistNames ?? [])
                  .map((a: { name: string }) => a.name)
                  .filter((name: string) => !followedArtists.includes(name))
                  .sort()}
                value={selectedFollowArtist}
                onChange={(_, newValue) => setSelectedFollowArtist(newValue)}
                size="small"
                sx={styles.field}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search for an artist to follow"
                    inputProps={{ ...params.inputProps, "aria-label": "Follow an artist" }}
                  />
                )}
              />
              <Box
                component="button"
                type="button"
                onClick={handleFollowArtist}
                disabled={!selectedFollowArtist}
                sx={styles.addButton}
              >
                <Plus size={16} weight="bold" />
                Follow
              </Box>
            </Box>

            {followedArtists.length > 0 ? (
              <>
                <Box sx={styles.list}>
                  {followedArtists
                    .slice((artistsPage - 1) * artistsPerPage, artistsPage * artistsPerPage)
                    .map((artistName: string) => (
                      <Box key={artistName} sx={styles.row}>
                        <Box
                          component={RouterLink}
                          to={`/artist/${artistName.replace(/\./g, '')}`}
                          sx={styles.rowLink}
                        >
                          <Box component="span" sx={styles.avatar} aria-hidden>
                            {initials(artistName)}
                          </Box>
                          <Box component="span" className="following-name" sx={styles.name}>
                            {artistName}
                          </Box>
                        </Box>
                        <RemoveButton
                          label="Unfollow"
                          ariaLabel={`Unfollow ${artistName}`}
                          onClick={() => handleUnfollow(artistName)}
                        />
                      </Box>
                    ))}
                </Box>

                {followedArtists.length > artistsPerPage && (
                  <Box sx={styles.pagination}>
                    <Pagination
                      count={Math.ceil(followedArtists.length / artistsPerPage)}
                      page={artistsPage}
                      onChange={(_, page) => setArtistsPage(page)}
                      size="small"
                    />
                  </Box>
                )}
              </>
            ) : (
              <EmptyState
                headline="You're not following any artists yet"
                body="Search for an artist in the field above to start following them."
                action={{ label: 'Browse artists', href: '/' }}
              />
            )}
          </Box>
        )}

        {activeTab === "events" && (
          <Box component="section">
            <SectionHeader title="Event location monitoring" count={monitoredStates.length} />

            <Box component="p" sx={styles.intro}>
              Select the states where you'd like to receive notifications about new signing events.
              We'll send you an email whenever a new event is announced in one of your monitored locations.
              Adding a state will automatically enable event email notifications in your settings.
            </Box>

            {stateSuccess && (
              <Alert severity="success" sx={[styles.alert, styles.alertSuccess]}>
                {stateSuccess}
              </Alert>
            )}
            {stateError && (
              <Alert severity="error" sx={styles.alert}>
                {stateError}
              </Alert>
            )}

            <Box sx={styles.addRow}>
              <Autocomplete
                options={US_STATES.filter(state => !monitoredStates.includes(state))}
                value={selectedState}
                onChange={(_, newValue) => setSelectedState(newValue)}
                size="small"
                sx={styles.field}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select a state"
                    inputProps={{ ...params.inputProps, "aria-label": "Select a state" }}
                  />
                )}
              />
              <Box
                component="button"
                type="button"
                onClick={handleAddState}
                disabled={!selectedState}
                sx={styles.addButton}
              >
                <Plus size={16} weight="bold" />
                Add
              </Box>
            </Box>

            {monitoredStates.length > 0 ? (
              <Box sx={styles.list}>
                {[...monitoredStates].sort().map((state: string) => (
                  <Box key={state} sx={styles.row}>
                    <Box component="span" sx={styles.name}>
                      {state}
                    </Box>
                    <RemoveButton
                      label="Remove"
                      ariaLabel={`Stop monitoring ${state}`}
                      onClick={() => handleRemoveState(state)}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={styles.empty}>
                You are not monitoring any states yet. Select a state above to start receiving event notifications.
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: ReactNode; count: number }) {
  return (
    <Box sx={styles.sectionHeader}>
      <Box component="h2" sx={styles.sectionTitle}>
        {title}
      </Box>
      {count > 0 && <MonoLabel tracking="tight">{count} total</MonoLabel>}
    </Box>
  );
}

function RemoveButton({
  label,
  ariaLabel,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      sx={styles.removeButton}
    >
      <X size={12} weight="bold" />
      <span className="following-remove-label">{label}</span>
    </Box>
  );
}

export default Following;
