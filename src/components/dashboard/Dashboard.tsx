import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  Box,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  Cards,
  ClipboardText,
  Envelope,
  Heart,
  Shuffle,
} from "@phosphor-icons/react";
import { RootState } from "../../store/store";
import {
  GET_CURRENT_USER,
  GET_MY_CARD_COLLECTION,
  GET_SIGNINGEVENTS,
} from "../graphql/queries";
import {
  borderRadius,
  colors,
  shadows,
  themeColors,
  typography,
} from "../../styles/design-tokens";
import { usePageTitle } from "../../hooks/usePageTitle";

// ── Tool launcher items — mirrors the drawer in Header ────────────────────────

const TOOLS = [
  {
    href: "/yourcards",
    label: "Your Signed Cards",
    desc: "Track cards you've had signed at events",
    Icon: Cards,
  },
  {
    href: "/following",
    label: "Following",
    desc: "Artists and creators you're watching",
    Icon: Heart,
  },
  {
    href: "/signingtracker",
    label: "Signing Status Tracker",
    desc: "Manage your signing session wishlist",
    Icon: Envelope,
  },
  {
    href: "/artistsheet",
    label: "Artist Sheet Generator",
    desc: "Build a printable signing session sheet",
    Icon: ClipboardText,
  },
  {
    href: "/randomflavortext",
    label: "Random Flavor Text",
    desc: "A random piece of MTG flavor text",
    Icon: Shuffle,
  },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface SigningEvent {
  id: string;
  name: string;
  city: string;
  startDate: string;
  endDate: string;
  url: string;
}

interface CollectionItem {
  signedNonfoil: boolean;
  signedFoil: boolean;
  wishlistSigned: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const authUser = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  usePageTitle("My Dashboard");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER, {
    skip: !isLoggedIn,
  });

  const { data: collectionData, loading: collectionLoading } = useQuery(
    GET_MY_CARD_COLLECTION,
    { skip: !isLoggedIn }
  );

  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS, {
    skip: !isLoggedIn,
  });

  if (userLoading || collectionLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <CircularProgress size={28} sx={{ color: colors.primary.main }} />
      </Box>
    );
  }

  const user = userData?.me;
  const followedArtists: string[] = user?.followedArtists ?? [];
  const followCount = followedArtists.length;

  const collection: CollectionItem[] = collectionData?.myCardCollection ?? [];
  const signedCount = collection.filter(
    (c) => c.signedNonfoil || c.signedFoil
  ).length;
  const wishlistCount = collection.filter((c) => c.wishlistSigned).length;

  const now = new Date();
  const upcomingEvents: SigningEvent[] = (eventsData?.signingEvent ?? [])
    .filter((e: SigningEvent) => new Date(e.startDate) >= now)
    .sort(
      (a: SigningEvent, b: SigningEvent) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
    .slice(0, 5);

  const recentFollowed = followedArtists.slice(-4).reverse();

  const firstName =
    authUser?.name?.split(" ")[0] ??
    authUser?.email?.split("@")[0] ??
    "there";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      {/* ── Greeting ─────────────────────────────────────────────────────── */}
      <Typography
        component="h1"
        sx={{
          fontFamily: typography.fontFamily.heading,
          fontSize: { xs: typography.fontSize["3xl"], md: typography.fontSize["4xl"] },
          fontWeight: typography.fontWeight.normal,
          color: themeColors.text.primary,
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          mb: 0.5,
        }}
      >
        Hey, <em>{firstName}</em>.
      </Typography>
      <Typography
        sx={{
          fontSize: typography.fontSize.sm,
          color: themeColors.text.secondary,
          mb: 4,
        }}
      >
        Your collection hub
      </Typography>

      {/* ── Quick stats ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1.5,
          mb: 5,
        }}
      >
        {[
          { n: followCount, label: "Following" },
          { n: wishlistCount, label: "Wishlist to sign" },
          { n: signedCount, label: "Signed cards" },
        ].map(({ n, label }) => (
          <Paper
            key={label}
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              border: `1px solid ${themeColors.neutral[200]}`,
              borderRadius: borderRadius.md,
              backgroundColor: themeColors.background.paper,
            }}
          >
            <Typography
              sx={{
                fontFamily: typography.fontFamily.heading,
                fontSize: {
                  xs: typography.fontSize["2xl"],
                  sm: typography.fontSize["3xl"],
                },
                fontWeight: typography.fontWeight.normal,
                lineHeight: 1,
                color: themeColors.text.primary,
              }}
            >
              {n}
            </Typography>
            <Typography
              sx={{
                fontSize: typography.fontSize.xs,
                color: themeColors.text.secondary,
                mt: 0.5,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: typography.fontWeight.medium,
              }}
            >
              {label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* ── Next signings ─────────────────────────────────────────────────── */}
      <Box sx={{ mb: 5 }}>
        <SectionLabel>Next signings</SectionLabel>
        {followCount === 0 ? (
          <Typography
            sx={{
              fontSize: typography.fontSize.sm,
              color: themeColors.text.secondary,
              fontStyle: "italic",
            }}
          >
            Follow an artist to see their signings here.
          </Typography>
        ) : upcomingEvents.length === 0 ? (
          <Typography
            sx={{
              fontSize: typography.fontSize.sm,
              color: themeColors.text.secondary,
              fontStyle: "italic",
            }}
          >
            No upcoming signing events at the moment.
          </Typography>
        ) : (
          upcomingEvents.map((ev, i) => {
            return (
              <DataRow
                key={ev.id}
                first={i === 0}
                href={`/calendar/${ev.id}`}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontFamily: typography.fontFamily.heading,
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.normal,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                      color: themeColors.text.primary,
                    }}
                  >
                    {ev.name}
                  </Typography>
                  {ev.city && (
                    <Typography
                      sx={{
                        fontSize: typography.fontSize.xs,
                        color: themeColors.text.secondary,
                        mt: 0.25,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {ev.city}
                    </Typography>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontSize: typography.fontSize.xs,
                    color: themeColors.text.secondary,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {formatDate(ev.startDate)}
                </Typography>
              </DataRow>
            );
          })
        )}
      </Box>

      {/* ── Recently followed ─────────────────────────────────────────────── */}
      <Box sx={{ mb: 5 }}>
        <SectionLabel>Recently followed</SectionLabel>
        {recentFollowed.length === 0 ? (
          <Typography
            sx={{
              fontSize: typography.fontSize.sm,
              color: themeColors.text.secondary,
              fontStyle: "italic",
            }}
          >
            Follow artists to see them here.
          </Typography>
        ) : (
          <>
            {recentFollowed.map((name, i) => (
              <DataRow
                key={name}
                first={i === 0}
                href={`/artist/${encodeURIComponent(name)}`}
              >
                <Typography
                  sx={{
                    fontFamily: typography.fontFamily.heading,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.normal,
                    letterSpacing: "-0.01em",
                    color: themeColors.text.primary,
                  }}
                >
                  {name}
                </Typography>
                <ArrowRight
                  size={14}
                  style={{ color: colors.neutral[500], flexShrink: 0 }}
                />
              </DataRow>
            ))}
            {followCount > 4 && (
              <Box sx={{ pt: 1.25 }}>
                <RouterLink
                  to="/following"
                  style={{
                    fontSize: typography.fontSize.xs,
                    color: themeColors.primary.main,
                    textDecoration: "none",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: typography.fontWeight.medium,
                  }}
                >
                  View all {followCount} →
                </RouterLink>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* ── Tool launcher ─────────────────────────────────────────────────── */}
      <Box>
        <SectionLabel>Your tools</SectionLabel>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
            gap: 1.5,
          }}
        >
          {TOOLS.map(({ href, label, desc, Icon }) => (
            <Paper
              key={href}
              component={RouterLink}
              to={href}
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                border: `1px solid ${themeColors.neutral[200]}`,
                borderRadius: borderRadius.md,
                backgroundColor: themeColors.background.paper,
                textDecoration: "none",
                display: "block",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                "&:hover": {
                  borderColor: colors.primary.light,
                  boxShadow: shadows.sm,
                },
              }}
            >
              <Box sx={{ color: colors.primary.main, mb: 1 }}>
                <Icon size={22} weight="duotone" />
              </Box>
              <Typography
                sx={{
                  fontFamily: typography.fontFamily.heading,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.normal,
                  color: themeColors.text.primary,
                  letterSpacing: "-0.01em",
                  mb: 0.25,
                }}
              >
                {label}
              </Typography>
              <Typography
                sx={{
                  fontSize: typography.fontSize.xs,
                  color: themeColors.text.secondary,
                  lineHeight: 1.4,
                }}
              >
                {desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        color: themeColors.text.secondary,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        mb: 1,
      }}
    >
      {children}
    </Typography>
  );
}

function DataRow({
  children,
  first,
  href,
  external = false,
}: {
  children: React.ReactNode;
  first: boolean;
  href: string;
  external?: boolean;
}) {
  const sharedSx = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 1.5,
    py: 1.25,
    borderTop: first ? "none" : `1px solid ${themeColors.neutral[200]}`,
    textDecoration: "none",
    color: "inherit",
  };

  if (external) {
    return (
      <Box
        component="a"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        sx={sharedSx}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box component={RouterLink} to={href} sx={sharedSx}>
      {children}
    </Box>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default Dashboard;
