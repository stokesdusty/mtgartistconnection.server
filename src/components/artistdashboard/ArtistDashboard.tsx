import { Box, Button, FormControlLabel, Switch, TextField } from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink, Navigate, useLocation, useParams } from "react-router-dom";
import { SealCheck } from "@phosphor-icons/react";
import { RootState } from "../../store/store";
import { GET_ARTIST_DASHBOARD, GET_ARTIST_EDIT_LOG } from "../graphql/queries";
import { UPDATE_ARTIST_PROFILE } from "../graphql/mutations";
import { artistDashboardStyles as styles } from "../../styles/artist-dashboard-styles";
import MonoLabel from "../shared/MonoLabel";
import { SettingsSkeleton } from "../shared/Skeletons";
import { usePageTitle } from "../../hooks/usePageTitle";

// Must match MAX_NOTE_LENGTH in the webservice's services/artistProfile.ts
export const MAX_NOTE_LENGTH = 1000;

const LINK_FIELDS = [
  { field: "url", label: "Website", placeholder: "https://your-site.com" },
  { field: "instagram", label: "Instagram", placeholder: "https://instagram.com/you" },
  { field: "bluesky", label: "Bluesky", placeholder: "https://bsky.app/profile/you" },
  { field: "twitter", label: "Twitter / X", placeholder: "https://x.com/you" },
  { field: "facebook", label: "Facebook", placeholder: "https://facebook.com/you" },
  { field: "artstation", label: "ArtStation", placeholder: "https://artstation.com/you" },
  { field: "patreon", label: "Patreon", placeholder: "https://patreon.com/you" },
  { field: "youtube", label: "YouTube", placeholder: "https://youtube.com/@you" },
  { field: "omalink", label: "Original Magic Art", placeholder: "Link to your OMA store page" },
  { field: "inprnt", label: "INPRNT", placeholder: "https://inprnt.com/gallery/you" },
] as const;

const TEXT_FIELDS = ["email", "location", "artistNote", ...LINK_FIELDS.map((l) => l.field)] as const;
const TOGGLE_FIELDS = ["signing", "artistProofs"] as const;

type TextKey = typeof TEXT_FIELDS[number];
type ToggleKey = typeof TOGGLE_FIELDS[number];
type FormValues = Record<TextKey, string> & Record<ToggleKey, boolean>;

const FIELD_LABELS: Record<string, string> = {
  email: "Contact email",
  location: "Location",
  artistNote: "Note",
  signing: "Signing status",
  artistProofs: "Artist proofs",
  ...Object.fromEntries(LINK_FIELDS.map((l) => [l.field, l.label])),
};

// The admin form and older data use a mix of "true"/"yes"/"no"/"unknown".
const isYes = (value?: string | null) => value === "true" || value === "yes";

function toFormValues(artist: any): FormValues {
  const values = {} as FormValues;
  for (const field of TEXT_FIELDS) values[field] = artist?.[field] ?? "";
  for (const field of TOGGLE_FIELDS) values[field] = isYes(artist?.[field]);
  return values;
}

/** Only the fields the artist actually changed, in the shape the API expects. */
function changedInput(initial: FormValues, current: FormValues): Record<string, string> {
  const input: Record<string, string> = {};
  for (const field of TEXT_FIELDS) {
    if (current[field] !== initial[field]) input[field] = current[field];
  }
  for (const field of TOGGLE_FIELDS) {
    if (current[field] !== initial[field]) input[field] = current[field] ? "true" : "false";
  }
  return input;
}

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "";

const ArtistDashboard = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const { artistId: artistIdParam } = useParams();
  const location = useLocation();

  // network-only: saving from a stale cached copy would undo edits made elsewhere
  const { data, loading, error } = useQuery(GET_ARTIST_DASHBOARD, {
    variables: { artistId: artistIdParam },
    skip: !isLoggedIn,
    fetchPolicy: "network-only",
  });
  const artist = data?.artistDashboard;

  usePageTitle(artist ? `${artist.name} · Artist dashboard` : "Artist dashboard");

  if (!isLoggedIn) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (error || !artist) {
    return (
      <Box sx={styles.page}>
        <Box sx={styles.inner}>
          <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
            Artist dashboard
          </MonoLabel>
          <Box component="h1" sx={[styles.title, { mb: "28px" }]}>
            {error ? "No access" : "Not linked yet"}
          </Box>
          <Box component="section" sx={styles.panel}>
            <Box component="p" sx={[styles.sectionIntro, { mb: 0 }]}>
              {error ? (
                "Your account doesn't have access to this artist's dashboard."
              ) : (
                <>
                  This dashboard is for artists listed on MtG Artist Connection. If that's you,{" "}
                  <Box component={RouterLink} to="/contact" sx={styles.viewLink}>
                    contact us
                  </Box>{" "}
                  from the email on this account and we'll link it to your artist page.
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // Keyed so an admin moving between artists gets a fresh form
  return <DashboardForm key={artist.id} artist={artist} />;
};

function DashboardForm({ artist }: { artist: any }) {
  const { data: logData, refetch: refetchLog } = useQuery(GET_ARTIST_EDIT_LOG, {
    variables: { artistId: artist.id },
    fetchPolicy: "network-only",
  });

  const [updateArtistProfile, { loading: saving }] = useMutation(UPDATE_ARTIST_PROFILE);

  const [initial, setInitial] = useState<FormValues>(() => toFormValues(artist));
  const [values, setValues] = useState<FormValues>(() => toFormValues(artist));
  const [noteUpdatedAt, setNoteUpdatedAt] = useState<string | null>(artist.artistNoteUpdatedAt);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  const input = useMemo(() => changedInput(initial, values), [initial, values]);
  const hasChanges = Object.keys(input).length > 0;
  const noteTooLong = values.artistNote.length > MAX_NOTE_LENGTH;

  const setText = (field: TextKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaveError("");
    setSaveSuccess("");
    try {
      const { data: saved } = await updateArtistProfile({ variables: { artistId: artist.id, input } });
      const loaded = toFormValues(saved.updateArtistProfile);
      setInitial(loaded);
      setValues(loaded);
      setNoteUpdatedAt(saved.updateArtistProfile.artistNoteUpdatedAt);
      setSaveSuccess("Saved. Your artist page is updated.");
      refetchLog();
    } catch (err: any) {
      setSaveError(err.message || "Couldn't save your changes.");
    }
  };

  const log: any[] = logData?.artistEditLog ?? [];

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>
        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          Artist dashboard
        </MonoLabel>
        <Box sx={styles.titleRow}>
          <Box component="h1" sx={styles.title}>
            {artist.name}
          </Box>
          <Box component="span" sx={styles.verifiedChip}>
            <SealCheck size={14} weight="fill" aria-hidden />
            Verified artist
          </Box>
          <Box component={RouterLink} to={`/artist/${encodeURIComponent(artist.name)}`} sx={styles.viewLink}>
            View your page →
          </Box>
        </Box>

        <Box sx={styles.sections}>
          {/* ── Note ────────────────────────────────────────────────────── */}
          <Box component="section" aria-labelledby="dash-note" sx={styles.panel}>
            <Box component="h2" id="dash-note" sx={styles.sectionTitle}>
              Note from you
            </Box>
            <Box component="p" sx={styles.sectionIntro}>
              Shown on your artist page under "From the artist". Use it for signing prices, upcoming plans, or how
              collectors should reach you. Plain text only.
              {noteUpdatedAt && ` Last updated ${formatDate(noteUpdatedAt)}.`}
            </Box>
            <Box sx={styles.field}>
              <TextField
                id="dash-note-input"
                inputProps={{ "aria-labelledby": "dash-note" }}
                multiline
                minRows={4}
                maxRows={12}
                fullWidth
                value={values.artistNote}
                onChange={setText("artistNote")}
                error={noteTooLong}
                sx={styles.input}
              />
              <Box sx={[styles.noteCounter, noteTooLong && styles.noteCounterOver]} aria-live="polite">
                {values.artistNote.length} / {MAX_NOTE_LENGTH}
              </Box>
            </Box>
          </Box>

          {/* ── Signing ─────────────────────────────────────────────────── */}
          <Box component="section" aria-labelledby="dash-signing" sx={styles.panel}>
            <Box component="h2" id="dash-signing" sx={styles.sectionTitle}>
              Signing
            </Box>
            <Box sx={styles.prefList}>
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Switch
                    checked={values.signing}
                    onChange={() => setValues((prev) => ({ ...prev, signing: !prev.signing }))}
                    sx={styles.switch}
                  />
                }
                label="I'm currently signing cards"
                sx={styles.prefRow}
              />
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Switch
                    checked={values.artistProofs}
                    onChange={() => setValues((prev) => ({ ...prev, artistProofs: !prev.artistProofs }))}
                    sx={styles.switch}
                  />
                }
                label="I offer artist proofs"
                sx={styles.prefRow}
              />
            </Box>
          </Box>

          {/* ── Contact ─────────────────────────────────────────────────── */}
          <Box component="section" aria-labelledby="dash-contact" sx={styles.panel}>
            <Box component="h2" id="dash-contact" sx={styles.sectionTitle}>
              Contact & location
            </Box>
            <Box component="p" sx={styles.sectionIntro}>
              Both are shown publicly on your artist page. Leave the email blank to hide it.
            </Box>
            <Box sx={[styles.linkGrid, { mb: 0 }]}>
              <DashField id="dash-email" label="Contact email" value={values.email} onChange={setText("email")} type="email" />
              <DashField
                id="dash-location"
                label="Location"
                value={values.location}
                onChange={setText("location")}
                placeholder="City, State"
              />
            </Box>
          </Box>

          {/* ── Links ───────────────────────────────────────────────────── */}
          <Box component="section" aria-labelledby="dash-links" sx={styles.panel}>
            <Box component="h2" id="dash-links" sx={styles.sectionTitle}>
              Links
            </Box>
            <Box component="p" sx={styles.sectionIntro}>
              Leave a field blank to remove that link from your page.
            </Box>
            <Box sx={styles.linkGrid}>
              {LINK_FIELDS.map(({ field, label, placeholder }) => (
                <DashField
                  key={field}
                  id={`dash-${field}`}
                  label={label}
                  value={values[field]}
                  onChange={setText(field)}
                  placeholder={placeholder}
                  type="url"
                />
              ))}
            </Box>
          </Box>

          {/* ── History ─────────────────────────────────────────────────── */}
          {log.length > 0 && (
            <Box component="section" aria-labelledby="dash-history" sx={styles.panel}>
              <Box component="h2" id="dash-history" sx={styles.sectionTitle}>
                Recent changes
              </Box>
              <Box component="ul" sx={styles.logList}>
                {log.map((entry) => (
                  <Box component="li" key={entry.id} sx={styles.logItem}>
                    <Box sx={styles.logMeta}>
                      {formatDate(entry.createdAt)} · {entry.byAdmin ? "Site admin" : "You"}
                    </Box>
                    <Box>{entry.changes.map((c: any) => FIELD_LABELS[c.field] ?? c.field).join(", ")}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={styles.saveBar}>
          <Box sx={styles.saveHint} role={saveError ? "alert" : "status"}>
            {saveError ? (
              <Box component="span" sx={styles.saveError}>{saveError}</Box>
            ) : saveSuccess && !hasChanges ? (
              saveSuccess
            ) : hasChanges ? (
              "You have unsaved changes."
            ) : null}
          </Box>
          <Button sx={styles.button} onClick={handleSave} disabled={!hasChanges || saving || noteTooLong}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function DashField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Box sx={styles.field}>
      <Box component="label" htmlFor={id} sx={styles.fieldLabel}>
        <MonoLabel tracking="tight">{label}</MonoLabel>
      </Box>
      <TextField
        id={id}
        type={type}
        fullWidth
        size="small"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        sx={styles.input}
      />
    </Box>
  );
}

export default ArtistDashboard;
