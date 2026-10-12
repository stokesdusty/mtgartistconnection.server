import { useEffect, useState } from "react";
import { Box, Button, Dialog, IconButton } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { BellRinging, MapPin, Cards, Package, X } from "@phosphor-icons/react";
import { RootState } from "../../store/store";
import { signupPromptStyles as styles } from "../../styles/signup-prompt-styles";
import MonoLabel from "./MonoLabel";

// Set once the prompt has been shown (or the visitor has an account), so it never appears again.
export const SIGNUP_PROMPT_KEY = "signup-prompt-seen";

// Give visitors a moment with the page before interrupting them.
const SHOW_DELAY_MS = 15000;

// Pages where a sign-up pitch would be redundant or in the way.
const EXCLUDED_PATHS = ["/auth", "/privacypolicy", "/termsofservice", "/affiliate-disclosure", "/contact"];

const BENEFITS = [
  {
    icon: BellRinging,
    title: "Follow your favorite artists",
    body: "Get notified when they're added to a signing event or their info is updated.",
  },
  {
    icon: MapPin,
    title: "Signing events near you",
    body: "Pick the states you care about and hear about local signings first.",
  },
  {
    icon: Cards,
    title: "Track your collection",
    body: "Mark cards as signed, wishlisted, or artist proofs, all in one place.",
  },
  {
    icon: Package,
    title: "Signing tracker",
    body: "Keep tabs on batches of cards you've sent out for signatures.",
  },
];

const markSeen = () => localStorage.setItem(SIGNUP_PROMPT_KEY, "true");

const SignupPromptModal = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const isExcludedPath = EXCLUDED_PATHS.includes(pathname);

  // Anyone who has signed in already knows about accounts; never pitch them later.
  useEffect(() => {
    if (isLoggedIn) markSeen();
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn || isExcludedPath || localStorage.getItem(SIGNUP_PROMPT_KEY)) return;
    const timer = window.setTimeout(() => {
      markSeen();
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isLoggedIn, isExcludedPath]);

  const handleClose = () => setOpen(false);

  const handleSignup = () => {
    setOpen(false);
    navigate(`/auth?tab=signup&redirect=${encodeURIComponent(pathname)}`);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="signup-prompt-title"
      aria-describedby="signup-prompt-description"
      PaperProps={{ sx: styles.paper }}
      slotProps={{ backdrop: { sx: styles.backdrop } }}
    >
      <IconButton aria-label="Close" onClick={handleClose} sx={styles.close}>
        <X size={18} />
      </IconButton>

      <Box sx={styles.header}>
        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          Free account
        </MonoLabel>
        <Box component="h2" id="signup-prompt-title" sx={styles.title}>
          Join the <Box component="span" sx={styles.titleMuted}>vault.</Box>
        </Box>
        <Box component="p" id="signup-prompt-description" sx={styles.subtitle}>
          A free account unlocks a few extras for collectors:
        </Box>
      </Box>

      <Box component="ul" sx={styles.list}>
        {BENEFITS.map(({ icon: Icon, title, body }) => (
          <Box component="li" key={title} sx={styles.item}>
            <Box sx={styles.iconWrap}>
              <Icon size={18} weight="duotone" aria-hidden />
            </Box>
            <Box>
              <Box sx={styles.itemTitle}>{title}</Box>
              <Box sx={styles.itemBody}>{body}</Box>
            </Box>
          </Box>
        ))}
      </Box>

      <Box component="p" sx={styles.footnote}>
        All emails are opt-in. We never sell your data or share your email address.
      </Box>

      <Box sx={styles.actions}>
        <Button onClick={handleClose} sx={styles.secondaryButton}>
          Maybe later
        </Button>
        <Button onClick={handleSignup} variant="contained" disableElevation sx={styles.primaryButton}>
          Create free account
        </Button>
      </Box>
    </Dialog>
  );
};

export default SignupPromptModal;
