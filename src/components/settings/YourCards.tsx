import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useQuery } from "@apollo/client";
import { GET_MY_CARD_COLLECTION } from "../graphql/queries";
import { usePageTitle } from "../../hooks/usePageTitle";
import { colors } from "../../styles/design-tokens";

interface CollectionItem {
  id: string;
  scryfallId: string;
  cardName: string;
  artistName: string;
  set: string;
  collectorNumber: string;
  signedNonfoil: boolean;
  signedFoil: boolean;
  wishlistSigned: boolean;
  artistProof: boolean;
  artistProofFoil: boolean;
}

interface ArtistSummary {
  name: string;
  proofs: number;
  signed: number;
  wishlist: number;
}

const styles = {
  container: {
    backgroundColor: colors.background.dark,
    minHeight: "100vh",
    padding: { xs: 2, md: 4 },
  },
  paper: {
    padding: { xs: 3, md: 4 },
    backgroundColor: colors.neutral.white,
    borderRadius: "12px",
    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    border: `1px solid ${colors.neutral[200]}`,
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 80px 80px 80px',
    px: 1.5,
    py: 0.75,
    borderBottom: `1px solid ${colors.neutral[200]}`,
  },
  artistRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 80px 80px 80px',
    alignItems: 'center',
    px: 1.5,
    py: 0.75,
    borderRadius: '6px',
    transition: '150ms',
    textDecoration: 'none',
    color: 'inherit',
    '&:hover': { backgroundColor: colors.background.dark },
  },
  colLabel: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.hint,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    textAlign: 'center' as const,
  },
  artistName: {
    fontWeight: 500,
    fontSize: '0.8125rem',
    color: colors.primary.main,
    '&:hover': { textDecoration: 'underline' },
  },
  count: {
    fontSize: '0.8125rem',
    textAlign: 'center' as const,
  },
};

function buildArtistSummaries(items: CollectionItem[]): ArtistSummary[] {
  const map = new Map<string, ArtistSummary>();
  for (const item of items) {
    const name = item.artistName || "Unknown Artist";
    if (!map.has(name)) map.set(name, { name, proofs: 0, signed: 0, wishlist: 0 });
    const entry = map.get(name)!;
    if (item.artistProof || item.artistProofFoil) entry.proofs++;
    if (item.signedNonfoil || item.signedFoil) entry.signed++;
    if (item.wishlistSigned) entry.wishlist++;
  }
  return Array.from(map.values()).sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

const YourCards = () => {
  usePageTitle("Your Cards");
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const { data, loading } = useQuery(GET_MY_CARD_COLLECTION, {
    skip: !isLoggedIn,
  });

  if (!isLoggedIn) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={styles.paper}>
            <Typography sx={{ color: colors.accent.red, textAlign: "center", fontSize: "0.875rem", fontWeight: 500 }}>
              Error: You must be logged in to access this page
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={styles.container}>
        <Container maxWidth="md">
          <Paper elevation={0} sx={styles.paper}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress sx={{ color: colors.primary.main }} />
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  const items: CollectionItem[] = data?.myCardCollection ?? [];
  const artists = buildArtistSummaries(items);
  const totalProofs = artists.reduce((sum, a) => sum + a.proofs, 0);
  const totalSigned = artists.reduce((sum, a) => sum + a.signed, 0);
  const totalWishlist = artists.reduce((sum, a) => sum + a.wishlist, 0);

  return (
    <Box sx={styles.container}>
      <Container maxWidth="md">
        <Paper elevation={0} sx={styles.paper}>
          <Typography variant="h4" sx={{
            fontWeight: 700,
            color: colors.primary.main,
            mb: 0.5,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          }}>
            Your Cards
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: colors.text.hint, mb: 3 }}>
            {artists.length} {artists.length === 1 ? 'artist' : 'artists'}, {items.length} {items.length === 1 ? 'card' : 'cards'}
          </Typography>

          {artists.length === 0 ? (
            <Typography sx={{ color: colors.neutral[600], fontSize: '0.875rem', fontStyle: 'italic', py: 2 }}>
              No cards tracked yet. Visit an artist's card page and mark cards as signed, wishlisted, or artist proofs.
            </Typography>
          ) : (
            <Box>
              <Box sx={styles.headerRow}>
                <Typography sx={{ ...styles.colLabel, textAlign: 'left' }}>Artist</Typography>
                <Typography sx={styles.colLabel}>Proofs {totalProofs > 0 && `(${totalProofs})`}</Typography>
                <Typography sx={styles.colLabel}>Signed {totalSigned > 0 && `(${totalSigned})`}</Typography>
                <Typography sx={styles.colLabel}>Wishlist {totalWishlist > 0 && `(${totalWishlist})`}</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {artists.map((artist) => (
                  <Box
                    key={artist.name}
                    component={RouterLink}
                    to={`/allcards/${artist.name}`}
                    sx={styles.artistRow}
                  >
                    <Typography sx={styles.artistName}>{artist.name}</Typography>
                    <Typography sx={{ ...styles.count, color: artist.proofs > 0 ? colors.primary.main : colors.neutral[400] }}>
                      {artist.proofs > 0 ? artist.proofs : '—'}
                    </Typography>
                    <Typography sx={{ ...styles.count, color: artist.signed > 0 ? colors.primary.main : colors.neutral[400] }}>
                      {artist.signed > 0 ? artist.signed : '—'}
                    </Typography>
                    <Typography sx={{ ...styles.count, color: artist.wishlist > 0 ? colors.primary.main : colors.neutral[400] }}>
                      {artist.wishlist > 0 ? artist.wishlist : '—'}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default YourCards;
