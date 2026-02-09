import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_PASSWORD, UPDATE_EMAIL_PREFERENCES } from "../graphql/mutations";
import { GET_CURRENT_USER } from "../graphql/queries";

const Settings = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [emailPreferences, setEmailPreferences] = useState({
    siteUpdates: false,
    artistUpdates: false,
    localSigningEvents: false,
  });
  const [preferencesSuccess, setPreferencesSuccess] = useState("");

  const { data: userData, loading: userLoading, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !isLoggedIn,
  });

  const [updatePassword] = useMutation(UPDATE_PASSWORD);
  const [updateEmailPreferences] = useMutation(UPDATE_EMAIL_PREFERENCES);

  // Load user's email preferences when data is fetched
  useEffect(() => {
    if (userData?.me?.emailPreferences) {
      setEmailPreferences({
        siteUpdates: userData.me.emailPreferences.siteUpdates || false,
        artistUpdates: userData.me.emailPreferences.artistUpdates || false,
        localSigningEvents: userData.me.emailPreferences.localSigningEvents || false,
      });
    }
  }, [userData]);

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
    field: {
      mb: 2,
      "& .MuiOutlinedInput-root": {
        borderRadius: "8px",
        transition: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#2d4a36",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#2d4a36",
        },
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: "#2d4a36",
      },
    },
    button: {
      backgroundColor: "#2d4a36",
      color: "#ffffff",
      textTransform: "none",
      fontWeight: 600,
      padding: "10px 24px",
      borderRadius: "8px",
      transition: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        backgroundColor: "#1a2d21",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
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
              Error: You must be logged in to access settings
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

  const handlePasswordUpdate = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    try {
      const { data } = await updatePassword({
        variables: {
          currentPassword,
          newPassword,
        },
      });

      if (data?.updatePassword?.success) {
        setPasswordSuccess("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordError(data?.updatePassword?.message || "Failed to update password");
      }
    } catch (error: any) {
      setPasswordError(error.message || "An error occurred while updating password");
    }
  };

  const handlePreferencesUpdate = async () => {
    setPreferencesSuccess("");

    try {
      const { data } = await updateEmailPreferences({
        variables: {
          siteUpdates: emailPreferences.siteUpdates,
          artistUpdates: emailPreferences.artistUpdates,
          localSigningEvents: emailPreferences.localSigningEvents,
        },
      });

      if (data?.updateEmailPreferences?.success) {
        setPreferencesSuccess("Email preferences updated successfully");
        // Refetch user data to ensure UI is in sync with backend
        await refetch();
      }
    } catch (error: any) {
      console.error("Failed to update preferences:", error);
    }
  };

  const handlePreferenceChange = (preference: keyof typeof emailPreferences) => {
    setEmailPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference],
    }));
  };

  return (
    <Box sx={styles.container}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={styles.paper}>
          <Typography variant="h4" sx={{
            fontWeight: 700,
            color: "#2d4a36",
            mb: 4,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            Account Settings
          </Typography>

          <Box sx={styles.section}>
            <Typography sx={styles.sectionTitle}>Account Information</Typography>
            <Typography sx={{
              mb: 1,
              color: "#616161",
              fontSize: "0.875rem",
              lineHeight: 1.75,
            }}>
              <strong style={{ color: "#212121" }}>Email:</strong> {user?.email}
            </Typography>
            <Typography sx={{
              color: "#616161",
              fontSize: "0.875rem",
              lineHeight: 1.75,
            }}>
              <strong style={{ color: "#212121" }}>Name:</strong> {user?.name}
            </Typography>
          </Box>

          <Divider sx={{ my: 3, borderColor: "#e0e0e0" }} />

          <Box sx={styles.section}>
            <Typography sx={styles.sectionTitle}>Change Password</Typography>

            {passwordError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: "8px",
                  border: "1px solid #e74c3c",
                  backgroundColor: "#fef5f5",
                }}
              >
                {passwordError}
              </Alert>
            )}

            {passwordSuccess && (
              <Alert
                severity="success"
                sx={{
                  mb: 2,
                  borderRadius: "8px",
                  border: "1px solid #27ae60",
                  backgroundColor: "#f0f9f4",
                }}
              >
                {passwordSuccess}
              </Alert>
            )}

            <TextField
              label="Current Password"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={styles.field}
            />
            <TextField
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={styles.field}
              helperText="Must be at least 8 characters"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={styles.field}
            />
            <Button variant="contained" sx={styles.button} onClick={handlePasswordUpdate}>
              Update Password
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: "#e0e0e0" }} />

          <Box sx={styles.section}>
            <Typography sx={styles.sectionTitle}>Email Preferences</Typography>

            {preferencesSuccess && (
              <Alert
                severity="success"
                sx={{
                  mb: 2,
                  borderRadius: "8px",
                  border: "1px solid #27ae60",
                  backgroundColor: "#f0f9f4",
                }}
              >
                {preferencesSuccess}
              </Alert>
            )}

            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailPreferences.siteUpdates}
                    onChange={() => handlePreferenceChange("siteUpdates")}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#2d4a36",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#2d4a36",
                      },
                    }}
                  />
                }
                label="Receive site update emails"
                sx={{
                  mb: 1,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "#212121",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={emailPreferences.artistUpdates}
                    onChange={() => handlePreferenceChange("artistUpdates")}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#2d4a36",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#2d4a36",
                      },
                    }}
                  />
                }
                label="Receive artist update emails"
                sx={{
                  mb: 1,
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "#212121",
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={emailPreferences.localSigningEvents}
                    onChange={() => handlePreferenceChange("localSigningEvents")}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#2d4a36",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#2d4a36",
                      },
                    }}
                  />
                }
                label="Receive local signing event notifications"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    fontSize: "0.875rem",
                    color: "#212121",
                  },
                }}
              />
            </FormGroup>
            <Button
              variant="contained"
              sx={{ ...styles.button, mt: 2 }}
              onClick={handlePreferencesUpdate}
            >
              Save Preferences
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Settings;
