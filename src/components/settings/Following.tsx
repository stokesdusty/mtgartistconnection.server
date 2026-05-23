import {
  Box,
  Container,
  Paper,
  Typography,
  IconButton,
  Pagination,
  CircularProgress,
  Tabs,
  Tab,
  Autocomplete,
  TextField,
  Alert,
} from "@mui/material";
import { X, Plus } from "@phosphor-icons/react";
import { Link as RouterLink } from "react-router-dom";
import EmptyState from "../shared/EmptyState";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useMutation, useQuery } from "@apollo/client";
import { UNFOLLOW_ARTIST, FOLLOW_ARTIST, MONITOR_STATE, UNMONITOR_STATE } from "../graphql/mutations";
import { GET_CURRENT_USER, GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries";
import { colors } from "../../styles/design-tokens";

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

const Following = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [activeTab, setActiveTab] = useState(0);
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

  const { data: allArtistsData } = useQuery(GET_ARTISTS_FOR_HOMEPAGE, {
    skip: !isLoggedIn,
  });

  const [unfollowArtist] = useMutation(UNFOLLOW_ARTIST);
  const [followArtist] = useMutation(FOLLOW_ARTIST);
  const [monitorState] = useMutation(MONITOR_STATE);
  const [unmonitorState] = useMutation(UNMONITOR_STATE);

  const styles = {
    container: {
      backgroundColor: colors.background.dark,
      minHeight: "100vh",
      padding: { xs: 2, md: 4 },
    },
    paper: {
      padding: { xs: 3, md: 4 },
      backgroundColor: colors.neutral.white,
      borderRadius: "12px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      border: `1px solid ${colors.neutral[200]}`,
    },
    section: {
      mb: 4,
    },
    sectionTitle: {
      fontSize: { xs: "1.25rem", md: "1.5rem" },
      fontWeight: 600,
      color: colors.primary.main,
      mb: 2,
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    },
  };

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
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={styles.paper}>
            <Typography sx={{
              color: colors.accent.red,
              textAlign: "center",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}>
              Error: You must be logged in to access this page
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (userLoading) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress sx={{ color: colors.primary.main }} />
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={styles.paper}>
          <Typography variant="h4" sx={{
            fontWeight: 700,
            color: colors.primary.main,
            mb: 3,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            Following
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              mb: 4,
              borderBottom: `1px solid ${colors.neutral[300]}`,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                color: colors.neutral[600],
                '&.Mui-selected': {
                  color: colors.primary.main,
                  fontWeight: 600,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: colors.primary.main,
              },
            }}
          >
            <Tab label="Artists" />
            <Tab label="Events" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={styles.section}>
              <Typography sx={styles.sectionTitle}>
                Followed Artists
                {userData?.me?.followedArtists?.length > 0 && (
                  <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', fontWeight: 400, color: colors.neutral[600] }}>
                    ({userData.me.followedArtists.length} total)
                  </Typography>
                )}
              </Typography>

              {followSuccess && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: '8px', border: `1px solid ${colors.accent.green}`, backgroundColor: colors.primary.lighter }}>
                  {followSuccess}
                </Alert>
              )}
              {followError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', border: `1px solid ${colors.accent.red}`, backgroundColor: colors.accent.redLight }}>
                  {followError}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Autocomplete
                  options={(allArtistsData?.artists ?? [])
                    .map((a: { name: string }) => a.name)
                    .filter((name: string) => !userData?.me?.followedArtists?.includes(name))
                    .sort()}
                  value={selectedFollowArtist}
                  onChange={(_, newValue) => setSelectedFollowArtist(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Follow an artist"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary.main },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary.main },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: colors.primary.main },
                      }}
                    />
                  )}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={handleFollowArtist}
                  disabled={!selectedFollowArtist}
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: colors.neutral.white,
                    borderRadius: '8px',
                    width: '40px',
                    height: '40px',
                    '&:hover': { backgroundColor: colors.primary.dark },
                    '&:disabled': { backgroundColor: colors.neutral[300], color: colors.neutral[500] },
                  }}
                >
                  <Plus size={20} />
                </IconButton>
              </Box>

              {userData?.me?.followedArtists?.length > 0 ? (
                <>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                    {userData.me.followedArtists
                      .slice((artistsPage - 1) * artistsPerPage, artistsPage * artistsPerPage)
                      .map((artistName: string) => (
                        <Box
                          key={artistName}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: '6px',
                            transition: '150ms',
                            '&:hover': { backgroundColor: colors.neutral[100] },
                          }}
                        >
                          <Typography
                            component={RouterLink}
                            to={`/artist/${artistName}`}
                            sx={{
                              textDecoration: 'none',
                              color: colors.primary.main,
                              fontWeight: 500,
                              fontSize: '0.8125rem',
                              '&:hover': { textDecoration: 'underline' },
                            }}
                          >
                            {artistName}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleUnfollow(artistName)}
                            sx={{
                              color: colors.neutral[400],
                              padding: '2px',
                              '&:hover': { color: colors.accent.red, backgroundColor: 'transparent' },
                            }}
                            aria-label={`Unfollow ${artistName}`}
                          >
                            <X size={14} />
                          </IconButton>
                        </Box>
                      ))}
                  </Box>

                  {userData.me.followedArtists.length > artistsPerPage && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Pagination
                        count={Math.ceil(userData.me.followedArtists.length / artistsPerPage)}
                        page={artistsPage}
                        onChange={(_, page) => setArtistsPage(page)}
                        size="small"
                        color="primary"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            '&.Mui-selected': {
                              backgroundColor: colors.primary.main,
                              '&:hover': { backgroundColor: colors.primary.dark },
                            },
                          },
                        }}
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

          {activeTab === 1 && (
            <Box sx={styles.section}>
              <Typography sx={styles.sectionTitle}>
                Event Location Monitoring
              </Typography>

              <Typography sx={{
                mb: 3,
                color: colors.neutral[700],
                fontSize: '0.875rem',
                lineHeight: 1.75,
              }}>
                Select the states where you'd like to receive notifications about new signing events.
                We'll send you an email whenever a new event is announced in one of your monitored locations.
                Adding a state will automatically enable event email notifications in your settings.
              </Typography>

              {stateSuccess && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    borderRadius: "8px",
                    border: `1px solid ${colors.accent.green}`,
                    backgroundColor: colors.primary.lighter,
                  }}
                >
                  {stateSuccess}
                </Alert>
              )}

              {stateError && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    borderRadius: "8px",
                    border: `1px solid ${colors.accent.red}`,
                    backgroundColor: colors.accent.redLight,
                  }}
                >
                  {stateError}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Autocomplete
                  options={US_STATES.filter(state => !userData?.me?.monitoredStates?.includes(state))}
                  value={selectedState}
                  onChange={(_, newValue) => setSelectedState(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select a state"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: colors.primary.main,
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: colors.primary.main,
                        },
                      }}
                    />
                  )}
                  sx={{ flex: 1 }}
                />
                <IconButton
                  onClick={handleAddState}
                  disabled={!selectedState}
                  sx={{
                    backgroundColor: colors.primary.main,
                    color: colors.neutral.white,
                    borderRadius: '8px',
                    width: '48px',
                    height: '48px',
                    '&:hover': {
                      backgroundColor: colors.primary.dark,
                    },
                    '&:disabled': {
                      backgroundColor: colors.neutral[300],
                      color: colors.neutral[500],
                    },
                  }}
                >
                  <Plus size={24} />
                </IconButton>
              </Box>

              {userData?.me?.monitoredStates?.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                  {[...userData.me.monitoredStates].sort().map((state: string) => (
                    <Box
                      key={state}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '6px',
                        transition: '150ms',
                        '&:hover': { backgroundColor: colors.neutral[100] },
                      }}
                    >
                      <Typography sx={{ color: colors.primary.main, fontWeight: 500, fontSize: '0.8125rem' }}>
                        {state}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveState(state)}
                        sx={{
                          color: colors.neutral[400],
                          padding: '2px',
                          '&:hover': { color: colors.accent.red, backgroundColor: 'transparent' },
                        }}
                        aria-label={`Stop monitoring ${state}`}
                      >
                        <X size={14} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{
                  color: colors.neutral[600],
                  fontSize: '0.875rem',
                  fontStyle: 'italic',
                  py: 2,
                }}>
                  You are not monitoring any states yet. Select a state above to start receiving event notifications.
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default Following;
