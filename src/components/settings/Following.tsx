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
  Chip,
  Alert,
} from "@mui/material";
import { Close, Add } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useMutation, useQuery } from "@apollo/client";
import { UNFOLLOW_ARTIST, MONITOR_STATE, UNMONITOR_STATE } from "../graphql/mutations";
import { GET_CURRENT_USER } from "../graphql/queries";

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

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !isLoggedIn,
  });

  const [unfollowArtist] = useMutation(UNFOLLOW_ARTIST);
  const [monitorState] = useMutation(MONITOR_STATE);
  const [unmonitorState] = useMutation(UNMONITOR_STATE);

  const styles = {
    container: {
      backgroundColor: "#f5f5f5",
      minHeight: "100vh",
      padding: { xs: 2, md: 4 },
    },
    paper: {
      padding: { xs: 3, md: 4 },
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      border: "1px solid #eeeeee",
    },
    section: {
      mb: 4,
    },
    sectionTitle: {
      fontSize: { xs: "1.25rem", md: "1.5rem" },
      fontWeight: 600,
      color: "#2d4a36",
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
              color: "#e74c3c",
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
              <CircularProgress sx={{ color: '#2d4a36' }} />
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
            color: "#2d4a36",
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
              borderBottom: '1px solid #e0e0e0',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                color: '#757575',
                '&.Mui-selected': {
                  color: '#2d4a36',
                  fontWeight: 600,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2d4a36',
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
                <Typography component="span" sx={{ ml: 1, fontSize: '0.875rem', fontWeight: 400, color: '#757575' }}>
                  ({userData.me.followedArtists.length} total)
                </Typography>
              )}
            </Typography>

            {userData?.me?.followedArtists?.length > 0 ? (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {userData.me.followedArtists
                    .slice((artistsPage - 1) * artistsPerPage, artistsPage * artistsPerPage)
                    .map((artistName: string) => (
                      <Box
                        key={artistName}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 2,
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          border: '1px solid #e0e0e0',
                          transition: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            backgroundColor: '#f0f0f0',
                          },
                        }}
                      >
                        <Typography
                          component={RouterLink}
                          to={`/artist/${artistName}`}
                          sx={{
                            textDecoration: 'none',
                            color: '#2d4a36',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {artistName}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUnfollow(artistName)}
                          sx={{
                            color: '#e74c3c',
                            '&:hover': {
                              backgroundColor: 'rgba(231, 76, 60, 0.1)',
                            },
                          }}
                          aria-label={`Unfollow ${artistName}`}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                </Box>

                {userData.me.followedArtists.length > artistsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={Math.ceil(userData.me.followedArtists.length / artistsPerPage)}
                      page={artistsPage}
                      onChange={(_, page) => setArtistsPage(page)}
                      color="primary"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          '&.Mui-selected': {
                            backgroundColor: '#2d4a36',
                            '&:hover': {
                              backgroundColor: '#1a2d21',
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                )}
              </>
            ) : (
              <Typography sx={{
                color: '#757575',
                fontSize: '0.875rem',
                fontStyle: 'italic',
                py: 2,
              }}>
                You are not following any artists yet. Visit an artist's page to follow them and receive updates.
              </Typography>
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
                color: '#616161',
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
                    border: "1px solid #27ae60",
                    backgroundColor: "#f0f9f4",
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
                    border: "1px solid #e74c3c",
                    backgroundColor: "#fef5f5",
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
                            borderColor: '#2d4a36',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#2d4a36',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#2d4a36',
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
                    backgroundColor: '#2d4a36',
                    color: '#ffffff',
                    borderRadius: '8px',
                    width: '48px',
                    height: '48px',
                    '&:hover': {
                      backgroundColor: '#1a2d21',
                    },
                    '&:disabled': {
                      backgroundColor: '#e0e0e0',
                      color: '#9e9e9e',
                    },
                  }}
                >
                  <Add />
                </IconButton>
              </Box>

              {userData?.me?.monitoredStates?.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {userData.me.monitoredStates.map((state: string) => (
                    <Chip
                      key={state}
                      label={state}
                      onDelete={() => handleRemoveState(state)}
                      deleteIcon={<Close />}
                      sx={{
                        backgroundColor: '#f0f9f4',
                        border: '1px solid #2d4a36',
                        color: '#2d4a36',
                        fontWeight: 500,
                        '& .MuiChip-deleteIcon': {
                          color: '#2d4a36',
                          '&:hover': {
                            color: '#1a2d21',
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography sx={{
                  color: '#757575',
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
