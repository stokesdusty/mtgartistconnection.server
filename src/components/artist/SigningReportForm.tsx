import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { Box, Button, Dialog, IconButton, MenuItem, TextField } from "@mui/material";
import { Plus, Trash, X } from "@phosphor-icons/react";
import { SUBMIT_SIGNING_REPORT } from "../graphql/mutations";
import MonoLabel from "../shared/MonoLabel";
import { signingReportStyles as styles } from "../../styles/signing-reports-styles";
import {
  EXTRA_LABELS,
  METHOD_LABELS,
  NOTE_MAX_LENGTH,
  SIGNING_EXTRA_KINDS,
  SIGNING_METHODS,
  SigningExtraKind,
  SigningMethod,
} from "../../utils/signingReports";

export interface ReportableEvent {
  id: string;
  name: string;
  startDate: string;
}

interface SigningReportFormProps {
  open: boolean;
  onClose: () => void;
  artistName: string;
  /** Events the artist attended, offered when the method is a convention or store event. */
  events: ReportableEvent[];
  onSubmitted: (status: "approved" | "pending") => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const toNumber = (value: string): number | null => (value.trim() === "" ? null : Number(value));
const toInt = (value: string): number | null => {
  const n = toNumber(value);
  return n === null ? null : Math.trunc(n);
};

const initialState = () => ({
  signedOn: today(),
  method: "convention" as SigningMethod,
  pricePerSig: "",
  freeCount: "",
  perPersonLimit: "",
  turnaroundWeeks: "",
  eventId: "",
  serviceName: "",
  note: "",
  extras: [] as { kind: SigningExtraKind; price: string }[],
});

const SigningReportForm = ({ open, onClose, artistName, events, onSubmitted }: SigningReportFormProps) => {
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState("");
  const [submittedStatus, setSubmittedStatus] = useState<"approved" | "pending" | null>(null);
  const [submitReport, { loading }] = useMutation(SUBMIT_SIGNING_REPORT);

  // Start fresh each time the dialog opens.
  useEffect(() => {
    if (open) {
      setForm(initialState());
      setError("");
      setSubmittedStatus(null);
    }
  }, [open]);

  const set = <K extends keyof ReturnType<typeof initialState>>(key: K, value: ReturnType<typeof initialState>[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const showEvent = (form.method === "convention" || form.method === "store_event") && events.length > 0;
  const showTurnaround = form.method === "mail_in" || form.method === "signing_service";
  const unusedExtras = SIGNING_EXTRA_KINDS.filter((k) => !form.extras.some((e) => e.kind === k));

  const handleSubmit = async () => {
    setError("");
    const price = toNumber(form.pricePerSig);
    if (price === null || Number.isNaN(price) || price < 0 || price > 500) {
      setError("Enter the price per signature (use 0 if it was free).");
      return;
    }
    if (!form.signedOn) {
      setError("Enter the date of the signing.");
      return;
    }
    if (form.extras.some((e) => e.price.trim() === "" || Number.isNaN(Number(e.price)))) {
      setError("Enter a price for each extra, or remove it.");
      return;
    }

    try {
      const { data } = await submitReport({
        variables: {
          artistName,
          input: {
            signedOn: form.signedOn,
            method: form.method,
            pricePerSig: price,
            freeCount: toInt(form.freeCount),
            perPersonLimit: toInt(form.perPersonLimit),
            turnaroundWeeks: showTurnaround ? toInt(form.turnaroundWeeks) : null,
            eventId: showEvent && form.eventId ? form.eventId : null,
            serviceName: form.method === "signing_service" ? form.serviceName.trim() || null : null,
            note: form.note.trim() || null,
            extras: form.extras.map((e) => ({ kind: e.kind, price: Number(e.price) })),
          },
        },
      });
      const status = data?.submitSigningReport?.status === "approved" ? "approved" : "pending";
      setSubmittedStatus(status);
      onSubmitted(status);
    } catch (err: any) {
      setError(err.message || "Couldn't submit your report. Please try again.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="signing-report-title"
      PaperProps={{ sx: styles.dialogPaper }}
      slotProps={{ backdrop: { sx: styles.backdrop } }}
    >
      <IconButton aria-label="Close" onClick={onClose} sx={styles.close}>
        <X size={18} />
      </IconButton>

      <MonoLabel tone="accent" tracking="wide">Signing report</MonoLabel>
      <Box component="h2" id="signing-report-title" sx={styles.dialogTitle}>
        {artistName}
      </Box>

      {submittedStatus ? (
        <>
          <Box role="status" sx={styles.success}>
            {submittedStatus === "approved"
              ? "Thanks! Your report is live on this page."
              : "Thanks! Your report will appear after a quick review."}
          </Box>
          <Box sx={styles.actions}>
            <Button onClick={onClose} variant="contained" disableElevation sx={styles.primaryButton}>
              Done
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Box component="p" sx={styles.dialogIntro}>
            Share what this artist charged so other collectors know what to expect.
          </Box>

          <Box sx={styles.fieldGrid}>
            <TextField
              select
              label="How did you get it signed?"
              value={form.method}
              onChange={(e) => set("method", e.target.value as SigningMethod)}
              sx={styles.input}
            >
              {SIGNING_METHODS.map((m) => (
                <MenuItem key={m} value={m}>{METHOD_LABELS[m]}</MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="When"
              value={form.signedOn}
              onChange={(e) => set("signedOn", e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: today() }}
              sx={styles.input}
            />

            {showEvent && (
              <TextField
                select
                label="Event (optional)"
                value={form.eventId}
                onChange={(e) => set("eventId", e.target.value)}
                sx={[styles.input, styles.fullWidth]}
              >
                <MenuItem value="">Not listed</MenuItem>
                {events.map((ev) => (
                  <MenuItem key={ev.id} value={ev.id}>{ev.name}</MenuItem>
                ))}
              </TextField>
            )}

            {form.method === "signing_service" && (
              <TextField
                label="Service name (optional)"
                value={form.serviceName}
                onChange={(e) => set("serviceName", e.target.value)}
                inputProps={{ maxLength: 80 }}
                sx={[styles.input, styles.fullWidth]}
              />
            )}

            <TextField
              label="Price per signature (USD)"
              type="number"
              value={form.pricePerSig}
              onChange={(e) => set("pricePerSig", e.target.value)}
              inputProps={{ min: 0, max: 500, step: 0.5, inputMode: "decimal" }}
              helperText="Use 0 if it was free"
              required
              sx={styles.input}
            />
            <TextField
              label="Free signatures (optional)"
              type="number"
              value={form.freeCount}
              onChange={(e) => set("freeCount", e.target.value)}
              inputProps={{ min: 0, step: 1, inputMode: "numeric" }}
              helperText={'e.g. "first 2 free"'}
              sx={styles.input}
            />
            <TextField
              label="Per-person limit (optional)"
              type="number"
              value={form.perPersonLimit}
              onChange={(e) => set("perPersonLimit", e.target.value)}
              inputProps={{ min: 0, step: 1, inputMode: "numeric" }}
              sx={styles.input}
            />
            {showTurnaround && (
              <TextField
                label="Turnaround in weeks (optional)"
                type="number"
                value={form.turnaroundWeeks}
                onChange={(e) => set("turnaroundWeeks", e.target.value)}
                inputProps={{ min: 0, step: 1, inputMode: "numeric" }}
                sx={styles.input}
              />
            )}

            <Box sx={styles.fullWidth}>
              <MonoLabel tracking="tight" sx={styles.extrasLabel}>Extras</MonoLabel>
              <Box sx={{ display: "flex", flexDirection: "column", gap: "10px", mt: "8px" }}>
                {form.extras.map((extra, i) => (
                  <Box key={extra.kind} sx={styles.extraRow}>
                    <TextField
                      select
                      size="small"
                      label="Extra"
                      value={extra.kind}
                      onChange={(e) =>
                        set("extras", form.extras.map((x, j) => (j === i ? { ...x, kind: e.target.value as SigningExtraKind } : x)))
                      }
                      sx={styles.input}
                    >
                      {[extra.kind, ...unusedExtras].map((k) => (
                        <MenuItem key={k} value={k}>{EXTRA_LABELS[k]}</MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      type="number"
                      label="Price"
                      value={extra.price}
                      onChange={(e) =>
                        set("extras", form.extras.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))
                      }
                      inputProps={{ min: 0, step: 1, inputMode: "decimal", "aria-label": `${EXTRA_LABELS[extra.kind]} price` }}
                      sx={styles.input}
                    />
                    <IconButton
                      aria-label={`Remove ${EXTRA_LABELS[extra.kind]}`}
                      onClick={() => set("extras", form.extras.filter((_, j) => j !== i))}
                      sx={styles.iconButton}
                    >
                      <Trash size={16} />
                    </IconButton>
                  </Box>
                ))}
                {unusedExtras.length > 0 && (
                  <Button
                    startIcon={<Plus size={14} />}
                    onClick={() => set("extras", [...form.extras, { kind: unusedExtras[0], price: "" }])}
                    sx={styles.textButton}
                  >
                    Add an extra (playmat, remarque, sketch…)
                  </Button>
                )}
              </Box>
            </Box>

            <TextField
              label="Note (optional)"
              value={form.note}
              onChange={(e) => set("note", e.target.value.slice(0, NOTE_MAX_LENGTH))}
              multiline
              minRows={2}
              helperText={`${form.note.length}/${NOTE_MAX_LENGTH} · No emails, phone numbers, addresses or links`}
              sx={[styles.input, styles.fullWidth]}
            />
          </Box>

          {error && <Box role="alert" sx={styles.error}>{error}</Box>}

          <Box component="p" sx={styles.formFootnote}>
            Reports are shown without your name. Reports with notes, and your first few reports, are checked before
            they appear.
          </Box>

          <Box sx={styles.actions}>
            <Button onClick={onClose} sx={styles.secondaryButton}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={loading} variant="contained" disableElevation sx={styles.primaryButton}>
              {loading ? "Submitting…" : "Submit report"}
            </Button>
          </Box>
        </>
      )}
    </Dialog>
  );
};

export default SigningReportForm;
