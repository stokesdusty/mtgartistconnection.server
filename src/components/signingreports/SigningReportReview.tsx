import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, TextField } from "@mui/material";
import { GET_PENDING_SIGNING_REPORTS } from "../graphql/queries";
import { DELETE_SIGNING_REPORT, REVIEW_SIGNING_REPORT } from "../graphql/mutations";
import MonoLabel from "../shared/MonoLabel";
import { usePageTitle } from "../../hooks/usePageTitle";
import { signingReportStyles as styles } from "../../styles/signing-reports-styles";
import {
  EXTRA_LABELS,
  METHOD_LABELS,
  SigningReport,
  describeTerms,
  formatMonth,
  formatPrice,
} from "../../utils/signingReports";

// Matches the webservice's OUTLIER_FACTOR.
const OUTLIER_FACTOR = 3;

interface PendingReport extends SigningReport {
  createdAt: string;
  submitterName: string | null;
  submitterApprovedCount: number;
  artistMedianPrice: number | null;
}

const isOutlier = (price: number, median: number | null) =>
  median !== null && median > 0 && (price > median * OUTLIER_FACTOR || price < median / OUTLIER_FACTOR);

const PendingReportCard = ({ report, onDone }: { report: PendingReport; onDone: () => void }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [reviewReport, { loading: reviewing }] = useMutation(REVIEW_SIGNING_REPORT);
  const [deleteReport, { loading: deleting }] = useMutation(DELETE_SIGNING_REPORT);

  const run = async (action: () => Promise<any>, field: string) => {
    setError("");
    try {
      const { data } = await action();
      if (data?.[field]?.success) onDone();
      else setError(data?.[field]?.message || "Something went wrong");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  const review = (status: "approved" | "rejected") =>
    run(() => reviewReport({ variables: { id: report.id, status, rejectionReason: reason.trim() || null } }), "reviewSigningReport");
  const remove = () => run(() => deleteReport({ variables: { id: report.id } }), "deleteSigningReport");

  const terms = describeTerms(report);
  const extras = (report.extras ?? []).map((e) => `${EXTRA_LABELS[e.kind]} ${formatPrice(e.price)}`).join(" · ");
  const busy = reviewing || deleting;

  return (
    <Box component="li" sx={styles.adminCard}>
      <Box sx={styles.adminCardHead}>
        <Box component={RouterLink} to={`/artist/${encodeURIComponent(report.artistName)}`} sx={styles.adminArtist}>
          {report.artistName}
        </Box>
        <Box component="span" sx={styles.reportPrice}>
          {formatPrice(report.pricePerSig)} / sig{" "}
          {isOutlier(report.pricePerSig, report.artistMedianPrice) && (
            <Box component="span" sx={styles.outlierChip}>Outlier</Box>
          )}
        </Box>
      </Box>
      <Box component="p" sx={styles.adminMeta}>
        {METHOD_LABELS[report.method]} · {formatMonth(report.signedOn)}
        {report.serviceName && ` · ${report.serviceName}`}
        {report.artistMedianPrice !== null && ` · artist median ${formatPrice(report.artistMedianPrice)}`}
      </Box>
      {(terms || extras) && <Box component="p" sx={styles.adminMeta}>{[terms, extras].filter(Boolean).join(" · ")}</Box>}
      {report.note && <Box component="p" sx={styles.reportNote}>"{report.note}"</Box>}
      <Box component="p" sx={styles.adminMeta}>
        From {report.submitterName ?? "unknown user"} · {report.submitterApprovedCount} approved before · submitted{" "}
        {new Date(report.createdAt).toLocaleDateString()}
      </Box>

      <Box sx={styles.adminActions}>
        <TextField
          size="small"
          placeholder="Rejection reason (optional, shown to the submitter)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={[styles.input, styles.rejectInput]}
        />
        <Button onClick={() => review("rejected")} disabled={busy} sx={styles.secondaryButton}>Reject</Button>
        <Button onClick={() => review("approved")} disabled={busy} variant="contained" disableElevation sx={styles.primaryButton}>
          Approve
        </Button>
        <Button onClick={remove} disabled={busy} sx={styles.deleteButton}>Delete</Button>
      </Box>
      {error && <Box role="alert" sx={styles.error}>{error}</Box>}
    </Box>
  );
};

const SigningReportReview = () => {
  usePageTitle("Review signing reports");
  const { data, loading, error, refetch } = useQuery(GET_PENDING_SIGNING_REPORTS, {
    variables: { limit: 100 },
    fetchPolicy: "network-only",
  });
  const reports: PendingReport[] = data?.pendingSigningReports ?? [];

  return (
    <Box sx={styles.adminPage}>
      <Box sx={styles.adminInner}>
        <MonoLabel tone="accent" size={12} tracking="wide">Admin</MonoLabel>
        <Box component="h1" sx={styles.adminTitle}>Signing reports</Box>

        {loading && !data && <Box sx={styles.emptyState}>Loading…</Box>}
        {error && <Box role="alert" sx={styles.error}>{error.message}</Box>}
        {!loading && !error && reports.length === 0 && <Box sx={styles.emptyState}>Nothing waiting for review.</Box>}

        <Box component="ul" sx={[styles.adminList, { listStyle: "none", m: 0, p: 0 }]}>
          {reports.map((r) => (
            <PendingReportCard key={r.id} report={r} onDone={() => refetch()} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SigningReportReview;
