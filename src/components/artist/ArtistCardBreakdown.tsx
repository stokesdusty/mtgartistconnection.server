import { Box, Button, CircularProgress, Typography, Container, Paper } from '@mui/material';
import axios from 'axios';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useParams } from 'react-router';
import { useLoading } from '../../LoadingContext';
import { useNavigate } from "react-router-dom";
import { useQuery } from '@apollo/client';
import { GET_ARTIST_BY_NAME } from '../graphql/queries';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { cardBreakdownStyles } from '../../styles/card-breakdown-styles';
import { colors, spacing } from '../../styles/design-tokens';
import { usePriceClickLogger } from '../../hooks/usePriceClickLogger';
import { tcgplayerProductUrl, tcgplayerSearchUrl } from '../../utils/affiliateLinks';

interface CardPrices {
    usd?: string | null;
    usd_foil?: string | null;
    usd_etched?: string | null;
}

interface Card {
    related_uris: {
        gatherer: string;
    };
    id: string;
    illustration_id?: string;
    image_uris?: {
        border_crop: string;
        art_crop?: string;
    };
    card_faces?: {
        illustration_id?: string;
        image_uris?: {
            normal: string;
            art_crop?: string;
        };
    }[];
    cmc: number;
    type_line: string;
    name: string;
    artist: string;
    colors?: string[]; // colors is now optional
    set: string;
    set_name: string;
    set_type?: string;
    collector_number: string;
    released_at: string;
    oracle_text: string;
    rarity: string;
    mana_cost: string;
    prices?: CardPrices;
    tcgplayer_id?: number;
    edhrec_rank?: number;
    reserved?: boolean;
    scryfall_uri?: string;
}

interface ScryfallResponse {
    data: Card[];
    has_more: boolean;
    next_page?: string;
    total_cards: number;
}

interface TypeData {
    type: string;
    count: number;
}
interface ColorData {
    color: string;
    fullName: string;
    count: number;
}
interface SetData {
    set: string;
    count: number;
}
interface YearData {
    year: number;
    newArt: number;
    reprints: number;
}
interface Artwork {
    key: string;
    /** Earliest printing of this illustration. */
    first: Card;
    printings: number;
    artCrop?: string;
}

// Gallery starts collapsed so prolific artists don't render hundreds of images up front.
const GALLERY_PREVIEW = 24;
const TOP_LIST_SIZE = 10;

// Double-faced cards keep the illustration on each face; use the front face's.
const illustrationKey = (card: Card) =>
    card.illustration_id ?? card.card_faces?.[0]?.illustration_id ?? `${card.name}|${card.id}`;

const artCrop = (card: Card) => card.image_uris?.art_crop ?? card.card_faces?.[0]?.image_uris?.art_crop;

const parsePrice = (value?: string | null) => (value ? parseFloat(value) : 0);

/** Highest market price across finishes, plus which finish it is. */
const topPrice = (card: Card): { value: number; finish: string } => {
    const options = [
        { value: parsePrice(card.prices?.usd), finish: 'Nonfoil' },
        { value: parsePrice(card.prices?.usd_foil), finish: 'Foil' },
        { value: parsePrice(card.prices?.usd_etched), finish: 'Etched' },
    ];
    return options.reduce((best, o) => (o.value > best.value ? o : best));
};

const formatUsd = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const colorNames = {
    'W': 'White',
    'U': 'Blue',
    'B': 'Black',
    'R': 'Red',
    'G': 'Green'
};

const ArtistCardAnalysis = () => {
    const { name: artist } = useParams<{ name?: string }>();
    const [isFetching, setIsFetching] = useState(false);
    const { setIsLoading } = useLoading(); // Get the setIsLoading function from the context
    const [error, setError] = useState<string | null>(null);
    const [cardsWithDupes, setCardsWithDupes] = useState<Card[]>([]);
    const [, setHasTriedBothQueries] = useState(false);
    const [noResultsFromPrimary, setNoResultsFromPrimary] = useState(false);
    const fallbackInitiatedRef = useRef(false);

    const { data: artistQueryData } = useQuery(GET_ARTIST_BY_NAME, {
        variables: { name: artist || "" },
        skip: !artist,
    });

    useEffect(() => {
        setNoResultsFromPrimary(false);
        fallbackInitiatedRef.current = false;
    }, [artist]);

    const navigate = useNavigate();
    useEffect(() => {
        if (!artist) {
            navigate("/");
        }
    }, [artist, navigate]);

    usePageTitle(artist ? `${artist} Card Breakdown` : undefined);

    const formattedArtistName = useMemo(() => {
        return artist?.split(" ").join(" ") || "";
    }, [artist]);

    const scryfallQuery = useMemo(() => {
        if (!formattedArtistName) return { withPaper: "", withoutPaper: "" };
        const baseQuery = "artist%3A";
        const encodedArtistName = encodeURIComponent(formattedArtistName);
        const formattedQuery = `${baseQuery}"${encodedArtistName}"`;
        return {
            withPaper: `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28game%3Apaper%29+%28${formattedQuery}%29`,
            withoutPaper: `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28${formattedQuery}%29`
        };
    }, [formattedArtistName]);

    const fetchCards = useCallback(
        async (
            url: string,
            previousData: Card[] = []
        ): Promise<Card[] | null> => {
            setIsFetching(true);
            try {
                const response = await axios.get<ScryfallResponse>(url);
                let allData: Card[] = [...previousData, ...response.data.data];

                if (response.data.has_more && response.data.next_page) {
                    const nextPageData = await fetchCards(
                        response.data.next_page,
                        allData
                    );
                    if (nextPageData) allData = nextPageData;
                }

                return allData;
            } catch (error: any) {
                console.error("Error fetching cards:", error);
                setError(error.message);
                return null;
            } finally {
                setIsFetching(false);
                setIsLoading(false);
            }
        },
        [setIsLoading]
    );

    useEffect(() => {
        const fetchData = async () => {
            if (!scryfallQuery.withPaper || !artist) return;

            const normalize = (str: string) =>
                str
                    .toLowerCase()
                    .trim()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/'/g, " ")
                    .replace(/\./g, "")
                    .replace(/-/g, " ")
                    .replace(/\s+/g, " ")
                    .trim();

            const fetchWithFallback = async (primaryUrl: string, fallbackUrl: string, normalizedName: string): Promise<Card[] | null> => {
                let data = await fetchCards(primaryUrl);
                if (!data) {
                    setError(null);
                    data = await fetchCards(fallbackUrl);
                }
                if (!data) return null;
                return data.filter((card) => {
                    const normalizedCardArtist = normalize(card.artist || "");
                    return normalizedCardArtist === normalizedName ||
                           normalizedCardArtist.split(/[&,]/).some(n => normalize(n) === normalizedName);
                });
            };

            // Try with primary artist name first (paper then non-paper fallback)
            const filtered = await fetchWithFallback(scryfallQuery.withPaper, scryfallQuery.withoutPaper, normalize(artist));
            setHasTriedBothQueries(true);

            if (filtered !== null && filtered.length > 0) {
                setCardsWithDupes(filtered);
            } else {
                // Signal the scryfall_name fallback effect to take over.
                // It will wait for artistQueryData to load if needed.
                setNoResultsFromPrimary(true);
            }
        };
        fetchData();
    }, [scryfallQuery, fetchCards, artist]);

    // Fallback: retry with scryfall_name when the primary fetch finds nothing.
    // Runs as a separate effect so it naturally waits for artistQueryData to resolve.
    useEffect(() => {
        if (!noResultsFromPrimary || fallbackInitiatedRef.current) return;
        const scryfallName = artistQueryData?.artistByName?.scryfall_name;
        // If artistQueryData hasn't loaded yet, keep noResultsFromPrimary true so we retry when it does.
        if (!scryfallName) {
            if (artistQueryData !== undefined) setError("No cards found");
            return;
        }

        const normalize = (str: string) =>
            str.toLowerCase().trim().normalize("NFD")
                .replace(/[̀-ͯ]/g, "").replace(/'/g, " ").replace(/\./g, "")
                .replace(/-/g, " ").replace(/\s+/g, " ").trim();

        if (normalize(scryfallName) === normalize(artist || "")) {
            setError("No cards found");
            return;
        }

        // Use a ref (no state change) to guard against being cancelled by our own re-render.
        // The state reset happens after the fetch completes inside run().
        fallbackInitiatedRef.current = true;

        const encoded = encodeURIComponent(scryfallName);
        const withPaper = `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28game%3Apaper%29+%28artist%3A"${encoded}"%29`;
        const withoutPaper = `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28artist%3A"${encoded}"%29`;
        const normalizedFallback = normalize(scryfallName);

        let cancelled = false;
        const run = async () => {
            if (cancelled) return;
            let data = await fetchCards(withPaper);
            if (cancelled) return;
            if (!data) {
                setError(null);
                data = await fetchCards(withoutPaper);
            }
            if (cancelled) return;
            if (!data) { setError("No cards found"); return; }
            const filtered = data.filter((card) => {
                const n = normalize(card.artist || "");
                return n === normalizedFallback || n.split(/[&,]/).some(p => normalize(p) === normalizedFallback);
            });
            if (filtered.length > 0) {
                setCardsWithDupes(filtered);
                setNoResultsFromPrimary(false);
            } else {
                setError("No cards found");
            }
        };
        run();
        return () => {
            cancelled = true;
            fallbackInitiatedRef.current = false;
        };
    }, [noResultsFromPrimary, artistQueryData, artist, fetchCards]);


    const logPriceClick = usePriceClickLogger('breakdown');
    const [showAllArt, setShowAllArt] = useState(false);

    const stats = useMemo(() => {
        const cards = cardsWithDupes;

        // Main type (before the —), bucketed into the common types
        const getMainCardType = (typeLine: string) => {
            if (!typeLine) return 'Unknown';
            const mainTypePart = typeLine.split('—')[0].trim();
            for (const t of ['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Land', 'Planeswalker']) {
                if (mainTypePart.includes(t)) return t;
            }
            return mainTypePart;
        };

        const countBy = <T,>(items: T[], keyOf: (item: T) => string | string[] | null) => {
            const dist: Record<string, number> = {};
            items.forEach((item) => {
                const keys = keyOf(item);
                if (keys === null) return;
                (Array.isArray(keys) ? keys : [keys]).forEach((k) => { dist[k] = (dist[k] || 0) + 1; });
            });
            return dist;
        };
        const byCountDesc = <T extends { count: number }>(a: T, b: T) => b.count - a.count;

        const typeData: TypeData[] = Object.entries(countBy(cards, (c) => (c.type_line ? getMainCardType(c.type_line) : null)))
            .map(([type, count]) => ({ type, count }))
            .sort(byCountDesc);

        const creatureTypeCount = Object.keys(countBy(cards, (c) => {
            const parts = c.type_line?.split('—') ?? [];
            return parts.length > 1 && parts[0].includes('Creature') ? parts[1].trim().split(' ') : null;
        })).length;

        const rarityDist = countBy(cards, (c) => c.rarity);

        const colorData: ColorData[] = Object.entries(countBy(cards, (c) => (c.colors?.length ? c.colors : 'C')))
            .map(([color, count]) => ({
                color,
                fullName: colorNames[color as keyof typeof colorNames] || (color === 'C' ? 'Colorless' : color),
                count,
            }))
            .sort(byCountDesc);

        const setData: SetData[] = Object.entries(countBy(cards, (c) => c.set_name))
            .map(([set, count]) => ({ set, count }))
            .sort(byCountDesc);

        // Lands are almost always 0 CMC and would drag the average down.
        const nonLands = cards.filter((c) => !c.type_line?.includes('Land'));
        const avgCmc = nonLands.length > 0 ? nonLands.reduce((sum, c) => sum + c.cmc, 0) / nonLands.length : 0;

        // Group printings by illustration: one painting reprinted 20 times is one artwork.
        const artworkMap = new Map<string, Artwork>();
        cards.forEach((card) => {
            const key = illustrationKey(card);
            const existing = artworkMap.get(key);
            if (!existing) {
                artworkMap.set(key, { key, first: card, printings: 1, artCrop: artCrop(card) });
                return;
            }
            existing.printings += 1;
            if (card.released_at < existing.first.released_at) existing.first = card;
            existing.artCrop = existing.artCrop ?? artCrop(card);
        });
        const artworks = Array.from(artworkMap.values())
            .sort((a, b) => b.first.released_at.localeCompare(a.first.released_at));
        const mostReprinted = [...artworks].sort((a, b) => b.printings - a.printings)[0];

        // Career timeline: new paintings vs reprints of older art, per year.
        const firstPrintingIds = new Set(artworks.map((a) => a.first.id));
        const yearMap = new Map<number, YearData>();
        cards.forEach((card) => {
            const year = Number(card.released_at?.slice(0, 4));
            if (!year) return;
            const row = yearMap.get(year) ?? { year, newArt: 0, reprints: 0 };
            if (firstPrintingIds.has(card.id)) row.newArt += 1; else row.reprints += 1;
            yearMap.set(year, row);
        });
        const years = Array.from(yearMap.keys());
        const firstYear = years.length ? Math.min(...years) : undefined;
        const lastYear = years.length ? Math.max(...years) : undefined;
        // Fill empty years so gaps in a career show up as gaps.
        const yearData: YearData[] = [];
        if (firstYear && lastYear) {
            for (let y = firstYear; y <= lastYear; y++) yearData.push(yearMap.get(y) ?? { year: y, newArt: 0, reprints: 0 });
        }
        const sortedByDate = [...cards].sort((a, b) => a.released_at.localeCompare(b.released_at));

        const mostValuable = cards
            .map((card) => ({ card, ...topPrice(card) }))
            .filter((c) => c.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, TOP_LIST_SIZE);

        // edhrec_rank is per card name, so keep one printing per name.
        const seenNames = new Set<string>();
        const mostPlayed = cards
            .filter((c) => c.edhrec_rank !== undefined)
            .sort((a, b) => a.edhrec_rank! - b.edhrec_rank!)
            .filter((c) => (seenNames.has(c.name) ? false : (seenNames.add(c.name), true)))
            .slice(0, TOP_LIST_SIZE);

        return {
            typeData,
            creatureTypeCount,
            rarityDist,
            colorData,
            setData,
            avgCmc,
            artworks,
            mostReprinted,
            yearData,
            firstYear,
            lastYear,
            firstCard: sortedByDate[0],
            // artworks is newest-first, keyed on each illustration's first printing.
            latestArt: artworks[0]?.first,
            mostValuable,
            mostPlayed,
            reservedCount: new Set(cards.filter((c) => c.reserved).map((c) => c.name)).size,
        };
    }, [cardsWithDupes]);

    // Colors for the charts
    const COLORS = [
        colors.accent.blue,
        colors.accent.green,
        colors.accent.orange,
        colors.accent.blueDark,
        colors.primary.main
    ];
    const COLOR_MAP = {
        'W': colors.neutral.white,
        'U': colors.accent.blue,
        'B': colors.neutral[900],
        'R': colors.accent.red,
        'G': colors.accent.green,
    };

    const artistDisplayName = cardsWithDupes.length > 0 ? cardsWithDupes[0].artist : artist;

    const tcgplayerLink = (card: Card) =>
        card.tcgplayer_id ? tcgplayerProductUrl(card.tcgplayer_id, 'breakdown') : tcgplayerSearchUrl(card.name, 'breakdown');

    const onTcgplayerClick = (card: Card) =>
        logPriceClick('tcgplayer', { artistName: artistDisplayName || '', cardName: card.name, cardSet: card.set });

    const statRow = (label: string, value: ReactNode) => (
        <Box component="li" sx={cardBreakdownStyles.statsItem}>
            <Typography component="span" sx={cardBreakdownStyles.statsLabel}>{label}</Typography>
            <Typography component="span" sx={cardBreakdownStyles.statsValue}>{value}</Typography>
        </Box>
    );

    if (isFetching) {
        return (
            <Box sx={cardBreakdownStyles.loadingContainer}>
              <CircularProgress size={60} sx={cardBreakdownStyles.loadingSpinner} />
            </Box>
          );
    }
    if(error) {
        return (
            <Box sx={cardBreakdownStyles.container}>
                <Container maxWidth="lg">
                    <Paper elevation={0} sx={cardBreakdownStyles.contentWrapper}>
                        <Typography sx={cardBreakdownStyles.errorMessage}>
                            {error === "No cards found" ? `No cards found for ${artist}` : `Error loading cards: ${error}`}
                        </Typography>
                    </Paper>
                </Container>
            </Box>
          );
    }
    if (!cardsWithDupes || cardsWithDupes.length === 0) {
        return (
            <Box sx={cardBreakdownStyles.container}>
                <Container maxWidth="lg">
                    <Paper elevation={0} sx={cardBreakdownStyles.contentWrapper}>
                        <Typography sx={cardBreakdownStyles.errorMessage}>
                            No cards found for {artist}
                        </Typography>
                    </Paper>
                </Container>
            </Box>
          );
    }

    const {
        typeData, creatureTypeCount, rarityDist, colorData, setData, avgCmc, artworks, mostReprinted,
        yearData, firstYear, lastYear, firstCard, latestArt, mostValuable, mostPlayed, reservedCount,
    } = stats;
    const visibleArtworks = showAllArt ? artworks : artworks.slice(0, GALLERY_PREVIEW);

    return (
        <Box sx={cardBreakdownStyles.container}>
            <Container maxWidth="lg">
                <Paper elevation={0} sx={cardBreakdownStyles.contentWrapper}>
                    <Typography sx={cardBreakdownStyles.pageTitle}>
                        Card Analysis Dashboard
                    </Typography>
                    <Typography sx={cardBreakdownStyles.artistTitle}>
                        {artistDisplayName}
                    </Typography>

                    {/* Headline numbers */}
                    <Box sx={cardBreakdownStyles.headlineGrid}>
                        <Box sx={cardBreakdownStyles.headlineTile}>
                            <Typography sx={cardBreakdownStyles.headlineValue}>{artworks.length}</Typography>
                            <Typography sx={cardBreakdownStyles.headlineLabel}>Unique artworks</Typography>
                        </Box>
                        <Box sx={cardBreakdownStyles.headlineTile}>
                            <Typography sx={cardBreakdownStyles.headlineValue}>{cardsWithDupes.length}</Typography>
                            <Typography sx={cardBreakdownStyles.headlineLabel}>Total printings</Typography>
                        </Box>
                        <Box sx={cardBreakdownStyles.headlineTile}>
                            <Typography sx={cardBreakdownStyles.headlineValue}>
                                {firstYear && lastYear ? lastYear - firstYear + 1 : '—'}
                            </Typography>
                            <Typography sx={cardBreakdownStyles.headlineLabel}>
                                {firstYear && lastYear ? `Years active (${firstYear}–${lastYear})` : 'Years active'}
                            </Typography>
                        </Box>
                        <Box sx={cardBreakdownStyles.headlineTile}>
                            <Typography sx={cardBreakdownStyles.headlineValue}>{setData.length}</Typography>
                            <Typography sx={cardBreakdownStyles.headlineLabel}>Sets illustrated</Typography>
                        </Box>
                    </Box>

                    {/* Card Statistics Summary */}
                    <Box sx={{ ...cardBreakdownStyles.chartCard, marginBottom: 4 }}>
                        <Typography sx={cardBreakdownStyles.chartTitle}>Card Statistics Summary</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: spacing.xl, md: spacing.xxl } }}>
                            <Box sx={cardBreakdownStyles.statsCard}>
                                <Typography sx={cardBreakdownStyles.statsTitle}>Career</Typography>
                                <Box component="ul" sx={cardBreakdownStyles.statsList}>
                                    {firstCard && statRow('First card:', `${firstCard.name} (${firstCard.set_name}, ${firstCard.released_at.slice(0, 4)})`)}
                                    {latestArt && statRow('Latest new art:', `${latestArt.name} (${latestArt.set_name}, ${latestArt.released_at.slice(0, 4)})`)}
                                    {mostReprinted && mostReprinted.printings > 1 &&
                                        statRow('Most reprinted art:', `${mostReprinted.first.name} (${mostReprinted.printings} printings)`)}
                                    {reservedCount > 0 && statRow('Reserved List cards:', reservedCount)}
                                </Box>
                            </Box>

                            <Box sx={cardBreakdownStyles.statsCard}>
                                <Typography sx={cardBreakdownStyles.statsTitle}>Gameplay</Typography>
                                <Box component="ul" sx={cardBreakdownStyles.statsList}>
                                    {statRow('Most common type:', typeData[0]?.type ?? 'N/A')}
                                    {statRow('Most common color:', colorData[0]?.fullName ?? 'N/A')}
                                    {statRow('Average CMC (nonland):', avgCmc.toFixed(2))}
                                    {statRow('Creature types:', creatureTypeCount)}
                                    <Box component="li" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: { sm: 'space-between' } }}>
                                        <Typography component="span" sx={cardBreakdownStyles.statsLabel}>Rarity:</Typography>
                                        <Typography component="span" sx={{ ...cardBreakdownStyles.statsValue, textAlign: { sm: 'right' } }}>
                                            {Object.entries(rarityDist)
                                                .map(([rarity, count]) => `${rarity.charAt(0).toUpperCase() + rarity.slice(1)}: ${count}`)
                                                .join(', ')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    {/* Career Timeline */}
                    {yearData.length > 0 && (
                        <Box sx={{ ...cardBreakdownStyles.chartCard, marginBottom: 4 }}>
                            <Typography sx={cardBreakdownStyles.chartTitle}>Career Timeline</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={yearData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[100]} vertical={false} />
                                    <XAxis
                                        dataKey="year"
                                        tick={{ fill: colors.neutral[700], fontSize: '0.75rem' }}
                                        axisLine={{ stroke: colors.neutral[300] }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        tick={{ fill: colors.neutral[700] }}
                                        axisLine={{ stroke: colors.neutral[300] }}
                                    />
                                    <Tooltip
                                        formatter={(value: number, name: string) => [`${value} printings`, name]}
                                        contentStyle={{ backgroundColor: `${colors.neutral.white}F2`, borderRadius: '4px', border: `1px solid ${colors.neutral[300]}` }}
                                        labelStyle={{ fontWeight: 'bold', color: colors.neutral[900] }}
                                    />
                                    <Legend
                                        iconSize={8}
                                        iconType="circle"
                                        formatter={(value) => <span style={{ color: colors.neutral[600], fontSize: '0.8rem' }}>{value}</span>}
                                    />
                                    <Bar dataKey="newArt" name="New art" stackId="year" fill={colors.primary.main} animationDuration={1500} />
                                    <Bar dataKey="reprints" name="Reprints" stackId="year" fill={colors.accent.orange} radius={[4, 4, 0, 0]} animationDuration={1500} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    )}

                    {/* Collector lists */}
                    <Box sx={cardBreakdownStyles.gridContainer}>
                        <Box sx={cardBreakdownStyles.chartCard}>
                            <Typography sx={cardBreakdownStyles.chartTitle}>Most Valuable Printings</Typography>
                            {mostValuable.length === 0 ? (
                                <Typography sx={cardBreakdownStyles.statsLabel}>No price data available.</Typography>
                            ) : (
                                <Box component="ol" sx={cardBreakdownStyles.rankList}>
                                    {mostValuable.map(({ card, value, finish }) => (
                                        <Box component="li" key={`${card.id}-${finish}`} sx={cardBreakdownStyles.rankRow}>
                                            <Box sx={cardBreakdownStyles.rankMain}>
                                                <Typography sx={cardBreakdownStyles.rankName}>
                                                    {card.name}
                                                    {card.reserved && <Box component="span" sx={cardBreakdownStyles.badge}>Reserved List</Box>}
                                                </Typography>
                                                <Typography sx={cardBreakdownStyles.rankMeta}>
                                                    {card.set_name} · #{card.collector_number} · {finish}
                                                </Typography>
                                            </Box>
                                            <Box
                                                component="a"
                                                href={tcgplayerLink(card)}
                                                target="_blank"
                                                rel="noopener noreferrer sponsored"
                                                title={`Buy ${card.name} on TCGplayer`}
                                                onClick={() => onTcgplayerClick(card)}
                                                sx={cardBreakdownStyles.priceLink}
                                            >
                                                {formatUsd(value)}
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box sx={cardBreakdownStyles.chartCard}>
                            <Typography sx={cardBreakdownStyles.chartTitle}>Most Played in Commander</Typography>
                            {mostPlayed.length === 0 ? (
                                <Typography sx={cardBreakdownStyles.statsLabel}>No EDHREC data available.</Typography>
                            ) : (
                                <Box component="ol" sx={cardBreakdownStyles.rankList}>
                                    {mostPlayed.map((card) => (
                                        <Box component="li" key={card.id} sx={cardBreakdownStyles.rankRow}>
                                            <Box sx={cardBreakdownStyles.rankMain}>
                                                <Typography sx={cardBreakdownStyles.rankName}>{card.name}</Typography>
                                                <Typography sx={cardBreakdownStyles.rankMeta}>{card.type_line}</Typography>
                                            </Box>
                                            <Typography sx={cardBreakdownStyles.rankValue}>
                                                #{card.edhrec_rank!.toLocaleString('en-US')}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            <Typography sx={{ ...cardBreakdownStyles.rankMeta, marginTop: spacing.md }}>
                                Overall EDHREC rank. Lower means played in more decks.
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={cardBreakdownStyles.gridContainer}>
                    {/* Card Type Distribution */}
                    <Box sx={cardBreakdownStyles.chartCard}>
                        <Typography sx={cardBreakdownStyles.chartTitle}>Card Type Distribution</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    fill={colors.primary.main}
                                    dataKey="count"
                                    nameKey="type"
                                    paddingAngle={3}
                                    animationDuration={1500}
                                    animationBegin={300}
                                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: colors.neutral[300], strokeWidth: 1 }}
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            stroke={colors.neutral.white}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number, name: string) => {
                                        const numValue = Number(value);
                                        const percentage = isNaN(numValue) ? 0 : ((numValue / cardsWithDupes.length) * 100).toFixed(1);
                                        return [`${value} cards (${percentage}%)`, name];
                                    }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '4px', border: `1px solid ${colors.neutral[300]}` }}
                                    labelStyle={{ fontWeight: 'bold', color: colors.neutral[900] }}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    align="center"
                                    iconSize={8} // This is a number, not a color.
                                    iconType="circle"
                                    formatter={(value) => <span style={{ color: colors.neutral[600], fontSize: '0.8rem' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* Color Distribution */}
                    <Box sx={cardBreakdownStyles.chartCard}>
                        <Typography sx={cardBreakdownStyles.chartTitle}>Color Distribution</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={colorData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[100]} />
                                <XAxis
                                    dataKey="fullName"
                                    tick={{ fill: colors.neutral[700], fontSize: '0.7rem' }}
                                    axisLine={{ stroke: colors.neutral[300] }}
                                />
                                <YAxis
                                    tick={{ fill: colors.neutral[700] }}
                                    axisLine={{ stroke: colors.neutral[300] }}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`${value} cards`, 'Count']}
                                    contentStyle={{ backgroundColor: `${colors.neutral.white}F2`, borderRadius: '4px', border: `1px solid ${colors.neutral[300]}` }}
                                    labelStyle={{ fontWeight: 'bold', color: colors.neutral[900] }}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={[4, 4, 0, 0]}
                                    animationDuration={1500}
                                >
                                    {colorData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLOR_MAP[entry.color as 'W' | 'U' | 'B' | 'R' | 'G'] || COLORS[index % COLORS.length]}
                                            stroke={colors.neutral.white}
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>

                {/* Set Distribution */}
                <Box sx={{ ...cardBreakdownStyles.chartCard, marginBottom: 4 }}>
                    <Typography sx={cardBreakdownStyles.chartTitle}>Set Distribution (Top 10)</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={setData.slice(0, 10)}
                            layout="vertical"
                            margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke={colors.neutral[100]} horizontal={true} vertical={false} />
                            <XAxis
                                type="number"
                                tick={{ fill: colors.neutral[700] }}
                                axisLine={{ stroke: colors.neutral[300] }}
                            />
                            <YAxis
                                dataKey="set"
                                type="category"
                                tick={{ fill: colors.neutral[700], fontSize: '0.75rem' }}
                                axisLine={{ stroke: colors.neutral[300] }}
                                width={70}
                            />
                            <Tooltip
                                formatter={(value: number) => [`${value} cards`, 'Count']}
                                contentStyle={{ backgroundColor: `${colors.neutral.white}F2`, borderRadius: '4px', border: `1px solid ${colors.neutral[300]}` }}
                                labelStyle={{ fontWeight: 'bold', color: colors.neutral[900] }}
                            />
                            <Bar
                                dataKey="count"
                                fill="url(#setGradient)"
                                radius={[0, 4, 4, 0]}
                                animationDuration={1500}
                            />
                            <defs>
                                <linearGradient id="setGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="5%" stopColor={colors.accent.orange} stopOpacity={0.9}/>
                                    <stop offset="95%" stopColor={colors.accent.orange} stopOpacity={0.6}/>
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                {/* Art Gallery: one tile per illustration, newest first */}
                <Box sx={cardBreakdownStyles.chartCard}>
                    <Typography sx={cardBreakdownStyles.chartTitle}>Art Gallery ({artworks.length})</Typography>
                    <Box sx={cardBreakdownStyles.galleryGrid}>
                        {visibleArtworks.map((art) => (
                            <Box
                                key={art.key}
                                component="a"
                                href={art.first.scryfall_uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={cardBreakdownStyles.galleryItem}
                            >
                                {art.artCrop ? (
                                    <Box component="img" src={art.artCrop} alt={art.first.name} loading="lazy" sx={cardBreakdownStyles.galleryImage} />
                                ) : (
                                    <Box sx={cardBreakdownStyles.galleryImage} />
                                )}
                                {art.printings > 1 && (
                                    <Box component="span" sx={cardBreakdownStyles.galleryBadge}>×{art.printings}</Box>
                                )}
                                <Box sx={cardBreakdownStyles.galleryCaption}>
                                    <Typography sx={cardBreakdownStyles.rankName}>{art.first.name}</Typography>
                                    <Typography sx={cardBreakdownStyles.rankMeta}>
                                        {art.first.set_name} · {art.first.released_at.slice(0, 4)}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                    {artworks.length > GALLERY_PREVIEW && (
                        <Box sx={{ textAlign: 'center', marginTop: spacing.lg }}>
                            <Button variant="outlined" onClick={() => setShowAllArt((v) => !v)}>
                                {showAllArt ? 'Show less' : `Show all ${artworks.length} artworks`}
                            </Button>
                        </Box>
                    )}
                </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ArtistCardAnalysis;
