import { useEffect, useState } from "react";
import { Box, Button, Typography, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { vault, spacing, borderRadius, shadows } from "../../styles/design-tokens";
import { loadGoogleAnalytics } from "../../utils/analytics";

const CONSENT_KEY = "cookie-consent";

type ConsentValue = "accepted" | "declined";

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
    if (stored === "accepted") {
      loadGoogleAnalytics();
    } else if (stored !== "declined") {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    loadGoogleAnalytics();
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Box
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1300,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.md,
        padding: `${spacing.md} ${spacing.lg}`,
        backgroundColor: vault.surface,
        borderTop: `1px solid ${vault.line}`,
        boxShadow: shadows.lg,
      }}
    >
      <Typography sx={{ color: vault.muted, fontSize: "0.875rem", flex: "1 1 320px" }}>
        We use cookies to analyze site traffic via Google Analytics. Read our{" "}
        <Link component={RouterLink} to="/privacypolicy" sx={{ color: vault.accentText }}>
          Privacy Policy
        </Link>{" "}
        to learn more. You can accept or decline analytics cookies.
      </Typography>
      <Box sx={{ display: "flex", gap: spacing.sm, flexShrink: 0 }}>
        <Button
          onClick={handleDecline}
          variant="outlined"
          size="small"
          sx={{
            color: vault.muted,
            borderColor: vault.lineStrong,
            borderRadius: borderRadius.sm,
            textTransform: "none",
          }}
        >
          Decline
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          size="small"
          disableElevation
          sx={{
            backgroundColor: vault.accent,
            color: vault.onAccent,
            fontWeight: 600,
            borderRadius: borderRadius.sm,
            textTransform: "none",
            "&:hover": { backgroundColor: vault.accent, opacity: 0.88 },
          }}
        >
          Accept
        </Button>
      </Box>
    </Box>
  );
};

export default CookieConsentBanner;
