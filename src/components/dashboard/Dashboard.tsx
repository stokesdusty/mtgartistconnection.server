import { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Box } from "@mui/material";
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
import { dashboardStyles as styles } from "../../styles/dashboard-styles";
import { usePageTitle } from "../../hooks/usePageTitle";
import { DashboardSkeleton } from "../shared/Skeletons";
import MonoLabel from "../shared/MonoLabel";
import GlowPill from "../shared/GlowPill";
import { eventCountdownLabel, formatDateRange } from "../../utils/eventDates";

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

  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_CURRENT_USER, {
    skip: !isLoggedIn,
  });

  const {
    data: collectionData,
    loading: collectionLoading,
    error: collectionError,
  } = useQuery(GET_MY_CARD_COLLECTION, { skip: !isLoggedIn });

  const { data: eventsData } = useQuery(GET_SIGNINGEVENTS, {
    skip: !isLoggedIn,
  });

  if (userLoading || collectionLoading) {
    return <DashboardSkeleton />;
  }

  if (userError || collectionError) {
    return (
      <Box sx={styles.page}>
        <Box sx={styles.inner}>
          <Box role="alert" sx={styles.errorPanel}>
            Error loading dashboard: {(userError ?? collectionError)?.message}
          </Box>
        </Box>
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

  const stats = [
    { n: followCount, label: "Following", href: "/following" },
    { n: wishlistCount, label: "Wishlist to sign" },
    { n: signedCount, label: "Signed cards", href: "/yourcards" },
  ];

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>
        {/* ── Greeting ─────────────────────────────────────────────────────── */}
        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          Your collection hub
        </MonoLabel>
        <Box component="h1" sx={styles.title}>
          Hey, {firstName}.{" "}
          <Box component="span" sx={styles.titleFaint}>
            Welcome back.
          </Box>
        </Box>

        {/* ── Quick stats ───────────────────────────────────────────────────── */}
        <Box sx={styles.stats}>
          {stats.map(({ n, label, href }) => (
            <Box
              key={label}
              {...(href ? { component: RouterLink, to: href } : {})}
              sx={[styles.stat, href ? styles.statLinked : {}]}
            >
              <Box component="span" sx={styles.statValue}>
                {n}
              </Box>
              <MonoLabel tracking="tight">{label}</MonoLabel>
            </Box>
          ))}
        </Box>

        {/* ── Next signings ─────────────────────────────────────────────────── */}
        <Section
          title="Next signings"
          aside={
            upcomingEvents.length > 0 && followCount > 0 ? (
              <Box component={RouterLink} to="/calendar" sx={styles.sectionLink}>
                <MonoLabel tone="inherit">Calendar →</MonoLabel>
              </Box>
            ) : null
          }
        >
          {followCount === 0 ? (
            <Box sx={styles.empty}>
              Follow an artist to see their signings here.
            </Box>
          ) : upcomingEvents.length === 0 ? (
            <Box sx={styles.empty}>
              No upcoming signing events at the moment.
            </Box>
          ) : (
            upcomingEvents.map((ev) => {
              const start = new Date(ev.startDate);
              const countdown = eventCountdownLabel(ev.startDate, ev.endDate);
              return (
                <Box
                  key={ev.id}
                  component={RouterLink}
                  to={`/calendar/${ev.id}`}
                  sx={styles.row}
                >
                  <Box sx={styles.dateBlock} aria-hidden>
                    <Box sx={styles.dateBlockMonth}>
                      {start.toLocaleDateString("en-US", { month: "short" })}
                    </Box>
                    <Box sx={styles.dateBlockDay}>{start.getDate()}</Box>
                  </Box>
                  <Box sx={styles.rowText}>
                    <Box sx={styles.rowTitleLine}>
                      <Box component="span" sx={styles.rowTitle}>
                        {ev.name}
                      </Box>
                      {countdown && <GlowPill>{countdown}</GlowPill>}
                    </Box>
                    <Box component="span" sx={styles.rowMeta}>
                      {formatDateRange(ev.startDate, ev.endDate)}
                      {ev.city && ` · ${ev.city}`}
                    </Box>
                  </Box>
                  <Box className="dashboard-row-arrow" sx={styles.arrow}>
                    <ArrowRight size={16} />
                  </Box>
                </Box>
              );
            })
          )}
        </Section>

        {/* ── Recently followed ─────────────────────────────────────────────── */}
        <Section
          title="Recently followed"
          aside={
            followCount > 4 ? (
              <Box component={RouterLink} to="/following" sx={styles.sectionLink}>
                <MonoLabel tone="inherit">View all {followCount} →</MonoLabel>
              </Box>
            ) : null
          }
        >
          {recentFollowed.length === 0 ? (
            <Box sx={styles.empty}>Follow artists to see them here.</Box>
          ) : (
            recentFollowed.map((name) => (
              <Box
                key={name}
                component={RouterLink}
                to={`/artist/${encodeURIComponent(name)}`}
                sx={styles.row}
              >
                <Box component="span" sx={styles.avatar} aria-hidden>
                  {initials(name)}
                </Box>
                <Box sx={styles.rowText}>
                  <Box component="span" sx={styles.rowTitle}>
                    {name}
                  </Box>
                </Box>
                <Box className="dashboard-row-arrow" sx={styles.arrow}>
                  <ArrowRight size={16} />
                </Box>
              </Box>
            ))
          )}
        </Section>

        {/* ── Tool launcher ─────────────────────────────────────────────────── */}
        <Section title="Your tools" last>
          <Box sx={styles.tools}>
            {TOOLS.map(({ href, label, desc, Icon }) => (
              <Box key={href} component={RouterLink} to={href} sx={styles.tool}>
                <Box sx={styles.toolIcon} aria-hidden>
                  <Icon size={20} weight="duotone" />
                </Box>
                <Box component="span" sx={styles.toolLabel}>
                  {label}
                </Box>
                <Box component="span" sx={styles.toolDesc}>
                  {desc}
                </Box>
              </Box>
            ))}
          </Box>
        </Section>
      </Box>
    </Box>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  aside,
  last = false,
  children,
}: {
  title: string;
  aside?: ReactNode;
  last?: boolean;
  children: ReactNode;
}) {
  return (
    <Box component="section" sx={[styles.section, last ? { mb: 0 } : {}]}>
      <Box sx={styles.sectionHeader}>
        <Box component="h2" sx={styles.sectionTitle}>
          {title}
        </Box>
        {aside}
      </Box>
      {children}
    </Box>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default Dashboard;
