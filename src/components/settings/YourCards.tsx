import { useState } from "react";
import EmptyState from "../shared/EmptyState";
import { Box, Theme } from "@mui/material";
import { SystemStyleObject } from "@mui/system";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, CaretDown, CaretUp } from "@phosphor-icons/react";
import { RootState } from "../../store/store";
import { useQuery } from "@apollo/client";
import { GET_MY_CARD_COLLECTION } from "../graphql/queries";
import { usePageTitle } from "../../hooks/usePageTitle";
import { yourCardsStyles as styles } from "../../styles/your-cards-styles";
import MonoLabel from "../shared/MonoLabel";
import { YourCardsSkeleton } from "../shared/Skeletons";
import WishlistShop from "./WishlistShop";

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

type SortKey = "name" | "proofs" | "signed" | "wishlist";
type SortDir = "asc" | "desc";

const byName = (a: ArtistSummary, b: ArtistSummary) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

function sortArtists(artists: ArtistSummary[], key: SortKey, dir: SortDir): ArtistSummary[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...artists].sort((a, b) => {
    if (key === "name") return sign * byName(a, b);
    // Ties fall back to name so equal counts stay alphabetical
    return sign * (a[key] - b[key]) || byName(a, b);
  });
}

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
  return Array.from(map.values());
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const Count = ({ n }: { n: number }) => (
  <Box component="span" sx={[styles.count, n > 0 ? styles.countActive : {}]}>
    {n > 0 ? n : "—"}
  </Box>
);

const SortHeader = ({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  sx,
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (column: SortKey) => void;
  sx?: SystemStyleObject<Theme>;
}) => {
  const active = sortKey === column;
  const Caret = sortDir === "asc" ? CaretUp : CaretDown;
  return (
    <Box
      role="columnheader"
      aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      sx={sx}
    >
      <Box component="button" type="button" onClick={() => onSort(column)} sx={styles.sortButton}>
        <MonoLabel tracking="tight" tone={active ? "accent" : "faint"}>{label}</MonoLabel>
        <Box component="span" sx={[styles.sortCaret, active ? {} : { visibility: "hidden" }]} aria-hidden>
          <Caret size={10} weight="bold" />
        </Box>
      </Box>
    </Box>
  );
};

const YourCards = () => {
  usePageTitle("Your Cards");
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (column: SortKey) => {
    if (column === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(column);
      // Counts are most useful biggest-first; names A→Z
      setSortDir(column === "name" ? "asc" : "desc");
    }
  };

  const { data, loading } = useQuery(GET_MY_CARD_COLLECTION, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
  });

  if (!isLoggedIn) {
    return (
      <Box sx={styles.page}>
        <Box sx={styles.inner}>
          <Box role="alert" sx={styles.statusPanel}>
            Error: You must be logged in to access this page
          </Box>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return <YourCardsSkeleton />;
  }

  const items: CollectionItem[] = data?.myCardCollection ?? [];
  const artists = sortArtists(buildArtistSummaries(items), sortKey, sortDir);
  const totalProofs = artists.reduce((sum, a) => sum + a.proofs, 0);
  const totalSigned = artists.reduce((sum, a) => sum + a.signed, 0);
  const totalWishlist = artists.reduce((sum, a) => sum + a.wishlist, 0);
  const wishlistItems = items.filter((item) => item.wishlistSigned);
  const sortProps = { sortKey, sortDir, onSort: handleSort };

  return (
    <Box sx={styles.page}>
      <Box sx={styles.inner}>
        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
          {artists.length} {artists.length === 1 ? 'artist' : 'artists'} · {items.length} {items.length === 1 ? 'card' : 'cards'}
        </MonoLabel>
        <Box component="h1" sx={styles.title}>
          Your cards
        </Box>

        {artists.length === 0 ? (
          <EmptyState
            headline="No cards tracked yet"
            body="Visit an artist's page and mark cards as signed, wishlisted, or artist proofs."
            action={{ label: 'Browse artists', href: '/' }}
            sx={{ mt: '36px' }}
          />
        ) : (
          <>
            <Box sx={styles.stats}>
              {[
                { n: totalSigned, label: 'Signed' },
                { n: totalWishlist, label: 'Wishlist' },
                { n: totalProofs, label: 'Artist proofs' },
              ].map(({ n, label }) => (
                <Box key={label} sx={styles.stat}>
                  <Box component="span" sx={styles.statValue}>{n}</Box>
                  <MonoLabel tracking="tight">{label}</MonoLabel>
                </Box>
              ))}
            </Box>

            <Box>
              <Box sx={styles.headerRow}>
                <SortHeader label="Artist" column="name" {...sortProps} />
                <SortHeader label="Proofs" column="proofs" {...sortProps} sx={styles.colLabel} />
                <SortHeader label="Signed" column="signed" {...sortProps} sx={styles.colLabel} />
                <SortHeader label="Wishlist" column="wishlist" {...sortProps} sx={styles.colLabel} />
                <Box sx={styles.arrowSpacer} />
              </Box>
              {artists.map((artist) => (
                <Box
                  key={artist.name}
                  component={RouterLink}
                  to={`/allcards/${artist.name.replace(/\./g, '')}`}
                  sx={styles.row}
                >
                  <Box sx={styles.artist}>
                    <Box component="span" sx={styles.avatar} aria-hidden>
                      {initials(artist.name)}
                    </Box>
                    <Box component="span" sx={styles.artistName}>{artist.name}</Box>
                  </Box>
                  <Box sx={{ display: 'grid' }}><Count n={artist.proofs} /></Box>
                  <Box sx={{ display: 'grid' }}><Count n={artist.signed} /></Box>
                  <Box sx={{ display: 'grid' }}><Count n={artist.wishlist} /></Box>
                  <Box className="your-cards-arrow" sx={styles.arrow} aria-hidden>
                    <ArrowRight size={16} />
                  </Box>
                </Box>
              ))}
            </Box>

            {wishlistItems.length > 0 && <WishlistShop items={wishlistItems} />}
          </>
        )}
      </Box>
    </Box>
  );
};

export default YourCards;
