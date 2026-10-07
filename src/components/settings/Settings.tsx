import {
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { ReactNode, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../store/store";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_PASSWORD, UPDATE_EMAIL_PREFERENCES } from "../graphql/mutations";
import { GET_CURRENT_USER } from "../graphql/queries";
import { settingsStyles as styles } from "../../styles/settings-styles";
import MonoLabel from "../shared/MonoLabel";
import { SettingsSkeleton } from "../shared/Skeletons";

const PREFERENCE_LABELS = {
  siteUpdates: "Receive site update emails",
  artistUpdates: "Receive artist update emails",
  localSigningEvents: "Receive local signing event notifications",
  newArtistNotifications: "Receive new artist notifications",
} as const;

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
    newArtistNotifications: false,
  });
  const [preferencesSuccess, setPreferencesSuccess] = useState("");
  const [preferencesError, setPreferencesError] = useState("");

  // network-only: the persisted Apollo cache can hold stale preferences, and saving
  // stale values would overwrite the user's real settings on the backend
  const { data: userData, loading: userLoading, refetch } = useQuery(GET_CURRENT_USER, {
    skip: !isLoggedIn,
    fetchPolicy: "network-only",
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
        newArtistNotifications: userData.me.emailPreferences.newArtistNotifications || false,
      });
    }
  }, [userData]);

  if (!isLoggedIn) {
    return <Navigate to="/auth?redirect=%2Fsettings" replace />;
  }

  if (userLoading) {
    return <SettingsSkeleton />;
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
    setPreferencesError("");

    try {
      const { data } = await updateEmailPreferences({
        variables: {
          siteUpdates: emailPreferences.siteUpdates,
          artistUpdates: emailPreferences.artistUpdates,
          localSigningEvents: emailPreferences.localSigningEvents,
          newArtistNotifications: emailPreferences.newArtistNotifications,
        },
      });

      if (data?.updateEmailPreferences?.success) {
        setPreferencesSuccess("Email preferences updated successfully");
        // Refetch user data to ensure UI is in sync with backend
        await refetch();
      } else {
        setPreferencesError(data?.updateEmailPreferences?.message || "Failed to update email preferences");
      }
    } catch (error: any) {
      setPreferencesError(error.message || "An error occurred while updating email preferences");
    }
  };

  const handlePreferenceChange = (preference: keyof typeof emailPreferences) => {
    setEmailPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference],
    }));
  };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>
        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          Account
        </MonoLabel>
        <Box component="h1" sx={styles.title}>
          Settings
        </Box>

        <Box sx={styles.sections}>
          {/* ── Account information ─────────────────────────────────────── */}
          <Box component="section" aria-labelledby="settings-account" sx={styles.panel}>
            <Box component="h2" id="settings-account" sx={styles.sectionTitle}>
              Account information
            </Box>
            <Box component="dl" sx={styles.infoList}>
              <Box sx={styles.infoRow}>
                <MonoLabel component="dt" tracking="tight">Email</MonoLabel>
                <Box component="dd" sx={styles.infoValue}>{user?.email}</Box>
              </Box>
              <Box sx={styles.infoRow}>
                <MonoLabel component="dt" tracking="tight">Name</MonoLabel>
                <Box component="dd" sx={styles.infoValue}>{user?.name}</Box>
              </Box>
            </Box>
          </Box>

          {/* ── Email preferences ───────────────────────────────────────── */}
          <Box component="section" aria-labelledby="settings-email" sx={styles.panel}>
            <Box component="h2" id="settings-email" sx={styles.sectionTitle}>
              Email preferences
            </Box>
            <Box component="p" sx={styles.sectionIntro}>
              Choose which emails you get from MtG Artist Connection.
            </Box>

            <Message error={preferencesError} success={preferencesSuccess} />

            <Box sx={styles.prefList}>
              {(Object.keys(PREFERENCE_LABELS) as (keyof typeof PREFERENCE_LABELS)[]).map((key) => (
                <FormControlLabel
                  key={key}
                  labelPlacement="start"
                  control={
                    <Switch
                      checked={emailPreferences[key]}
                      onChange={() => handlePreferenceChange(key)}
                      sx={styles.switch}
                    />
                  }
                  label={PREFERENCE_LABELS[key]}
                  sx={styles.prefRow}
                />
              ))}
            </Box>

            <Button sx={styles.button} onClick={handlePreferencesUpdate}>
              Save Preferences
            </Button>
          </Box>

          {/* ── Password ────────────────────────────────────────────────── */}
          <Box component="section" aria-labelledby="settings-password" sx={styles.panel}>
            <Box component="h2" id="settings-password" sx={styles.sectionTitle}>
              Change password
            </Box>
            <Box component="p" sx={styles.sectionIntro}>
              Enter your current password, then choose a new one.
            </Box>

            <Message error={passwordError} success={passwordSuccess} />

            <Box sx={styles.fields}>
              <PasswordField
                id="settings-current-password"
                label="Current password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={setCurrentPassword}
              />
              <PasswordField
                id="settings-new-password"
                label="New password"
                autoComplete="new-password"
                value={newPassword}
                onChange={setNewPassword}
                helperText="Must be at least 8 characters"
              />
              <PasswordField
                id="settings-confirm-password"
                label="Confirm new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
              />
            </Box>

            <Button sx={styles.button} onClick={handlePasswordUpdate}>
              Update Password
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Message({ error, success }: { error: string; success: string }) {
  if (error) {
    return (
      <Box role="alert" sx={[styles.message, styles.messageError]}>
        {error}
      </Box>
    );
  }
  if (success) {
    return (
      <Box role="status" sx={[styles.message, styles.messageSuccess]}>
        {success}
      </Box>
    );
  }
  return null;
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  helperText,
}: {
  id: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  helperText?: string;
}) {
  return (
    <Box sx={styles.field}>
      <Box component="label" htmlFor={id} sx={styles.fieldLabel}>
        <MonoLabel tracking="tight">{label}</MonoLabel>
      </Box>
      <TextField
        id={id}
        type="password"
        fullWidth
        size="small"
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        helperText={helperText}
        sx={styles.input}
      />
    </Box>
  );
}

export default Settings;
