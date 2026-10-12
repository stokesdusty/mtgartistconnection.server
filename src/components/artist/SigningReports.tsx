import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import { GET_RECENT_SIGNING_REPORTS, GET_SIGNING_REPORT_SUMMARY } from "../graphql/queries";
import { RootState } from "../../store/store";
import MonoLabel from "../shared/MonoLabel";
import SigningReportForm, { ReportableEvent } from "./SigningReportForm";
import { signingReportStyles as styles } from "../../styles/signing-reports-styles";
import {
  EXTRA_LABELS,
  METHOD_LABELS,
  SigningReport,
  SigningReportSummary,
  describeTerms,
  formatMonth,
  formatPrice,
  formatPriceRange,
  isStale,
} from "../../utils/signingReports";

const RECENT_LIMIT = 5;

interface SigningReportsProps {
  artistName: string;
  events: ReportableEvent[];
}

const ReportRow = ({ report, eventName }: { report: SigningReport; eventName?: string }) => {
  const terms = describeTerms(report);
  const extras = (report.extras ?? []).map((e) => `${EXTRA_LABELS[e.kind]} ${formatPrice(e.price)}`).join(" · ");
  const where = eventName ?? report.serviceName;

  return (
    <Box component="li" sx={[styles.reportItem, isStale(report.signedOn) && styles.reportItemStale]}>
      <Box component="span" sx={styles.reportDate}>{formatMonth(report.signedOn)}</Box>
      <Box sx={styles.reportBody}>
        {METHOD_LABELS[report.method]}
        {where && ` · ${where}`}
        {(terms || extras) && (
          <Box component="span" sx={styles.reportDetail}>{[terms, extras].filter(Boolean).join(" · ")}</Box>
        )}
        {report.note && <Box component="span" sx={styles.reportNote}>"{report.note}"</Box>}
      </Box>
      <Box component="span" sx={styles.reportPrice}>
        {formatPrice(report.pricePerSig)}
        {report.pricePerSig > 0 && <Box component="span" sx={styles.perSig}> / sig</Box>}
      </Box>
    </Box>
  );
};

const SigningReports = ({ artistName, events }: SigningReportsProps) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [formOpen, setFormOpen] = useState(false);

  const { data: summaryData, refetch: refetchSummary } = useQuery(GET_SIGNING_REPORT_SUMMARY, {
    variables: { artistName },
    fetchPolicy: "cache-and-network",
  });
  const { data: recentData, refetch: refetchRecent } = useQuery(GET_RECENT_SIGNING_REPORTS, {
    variables: { artistName, limit: RECENT_LIMIT },
    fetchPolicy: "cache-and-network",
  });

  const summary: SigningReportSummary | undefined = summaryData?.signingReportSummary;
  const recent: SigningReport[] = recentData?.recentSigningReports ?? [];
  const eventNames = new Map(events.map((e) => [e.id, e.name]));

  const openForm = () => {
    if (!isLoggedIn) {
      navigate(`/auth?tab=signup&redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    setFormOpen(true);
  };

  const handleSubmitted = (status: "approved" | "pending") => {
    if (status === "approved") {
      refetchSummary();
      refetchRecent();
    }
  };

  return (
    <Box component="section" aria-labelledby="artist-reports-label">
      <Box sx={styles.sectionHead}>
        <MonoLabel component="h2" id="artist-reports-label">Collector reports</MonoLabel>
        <Button onClick={openForm} sx={styles.reportButton}>
          {isLoggedIn ? "Report signing info" : "Sign in to report signing info"}
        </Button>
      </Box>

      {summary && summary.count > 0 && summary.minPrice !== null && summary.maxPrice !== null ? (
        <Box sx={styles.summary}>
          <Box component="p" sx={styles.summaryHeadline}>
            Collectors report <strong>{formatPriceRange(summary.minPrice, summary.maxPrice)}</strong> per signature
          </Box>
          <Box component="p" sx={styles.summaryMeta}>
            {summary.medianPrice !== null && `Median ${formatPrice(summary.medianPrice)} · `}
            {summary.count} {summary.count === 1 ? "report" : "reports"}
            {summary.latestSignedOn && ` · latest ${formatMonth(summary.latestSignedOn)}`}
          </Box>
          {summary.byMethod.length > 1 && (
            <Box sx={styles.methodChips}>
              {summary.byMethod.map((m) => (
                <Box component="span" key={m.method} sx={styles.methodChip}>
                  {METHOD_LABELS[m.method]}
                  {m.medianPrice !== null && ` · ${formatPrice(m.medianPrice)}`}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={styles.emptyState}>
          No recent reports yet. Got a signature from {artistName}? Share what it cost.
        </Box>
      )}

      {recent.length > 0 && (
        <Box component="ul" sx={styles.reportList} aria-label="Recent signing reports">
          {recent.map((r) => (
            <ReportRow key={r.id} report={r} eventName={r.eventId ? eventNames.get(r.eventId) : undefined} />
          ))}
        </Box>
      )}

      <Box component="p" sx={styles.disclaimer}>
        Reported by collectors, not confirmed by the artist. Prices change, so check with the artist before you go.
      </Box>

      <SigningReportForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        artistName={artistName}
        events={events}
        onSubmitted={handleSubmitted}
      />
    </Box>
  );
};

export default SigningReports;
