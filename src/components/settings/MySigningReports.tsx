import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { GET_MY_SIGNING_REPORTS } from "../graphql/queries";
import { DELETE_MY_SIGNING_REPORT } from "../graphql/mutations";
import { settingsStyles } from "../../styles/settings-styles";
import { signingReportStyles as styles } from "../../styles/signing-reports-styles";
import { METHOD_LABELS, SigningReport, formatMonth, formatPrice } from "../../utils/signingReports";

interface MyReport extends SigningReport {
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
}

const STATUS = {
  pending: { label: "In review", sx: styles.statusPending },
  approved: { label: "Live", sx: styles.statusApproved },
  rejected: { label: "Not published", sx: styles.statusRejected },
};

const MySigningReports = () => {
  const { data, refetch } = useQuery(GET_MY_SIGNING_REPORTS, { fetchPolicy: "network-only" });
  const [deleteReport] = useMutation(DELETE_MY_SIGNING_REPORT);
  const [error, setError] = useState("");
  const reports: MyReport[] = data?.mySigningReports ?? [];

  const handleDelete = async (id: string) => {
    setError("");
    try {
      const { data: result } = await deleteReport({ variables: { id } });
      if (!result?.deleteMySigningReport?.success) {
        setError(result?.deleteMySigningReport?.message || "Couldn't delete that report");
        return;
      }
      await refetch();
    } catch (err: any) {
      setError(err.message || "Couldn't delete that report");
    }
  };

  return (
    <Box component="section" aria-labelledby="settings-reports" sx={settingsStyles.panel}>
      <Box component="h2" id="settings-reports" sx={settingsStyles.sectionTitle}>
        Your signing reports
      </Box>
      <Box component="p" sx={settingsStyles.sectionIntro}>
        Prices you've reported on artist pages. They're shown without your name.
      </Box>

      {error && <Box role="alert" sx={styles.error}>{error}</Box>}

      {reports.length === 0 ? (
        <Box sx={styles.emptyState}>
          You haven't reported any signings yet. Use "Report signing info" on an artist's page.
        </Box>
      ) : (
        <Box component="ul" sx={styles.reportList}>
          {reports.map((r) => (
            <Box component="li" key={r.id} sx={styles.reportItem}>
              <Box component="span" sx={styles.reportDate}>{formatMonth(r.signedOn)}</Box>
              <Box sx={styles.reportBody}>
                <Box component={RouterLink} to={`/artist/${encodeURIComponent(r.artistName)}`} sx={{ color: "inherit" }}>
                  {r.artistName}
                </Box>
                {` · ${METHOD_LABELS[r.method]} · ${formatPrice(r.pricePerSig)}`}
                {r.status === "rejected" && r.rejectionReason && (
                  <Box component="span" sx={styles.reportDetail}>Reason: {r.rejectionReason}</Box>
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Box component="span" sx={STATUS[r.status].sx}>{STATUS[r.status].label}</Box>
                <Button
                  onClick={() => handleDelete(r.id)}
                  sx={styles.deleteButton}
                  aria-label={`Delete report for ${r.artistName}`}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MySigningReports;
