import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Box } from '@mui/material';
import { Globe, MagnifyingGlass } from '@phosphor-icons/react';
import { RootState } from '../../store/store';
import { SCAN_URL_FOR_ARTISTS } from '../graphql/mutations';
import { scanEventArtistsStyles as styles } from '../../styles/scan-event-artists-styles';
import MonoLabel from '../shared/MonoLabel';
import { LiveDot } from '../shared/GlowPill';

interface ImageMatch {
    imageUrl: string;
    matchedText: string;
}

interface ArtistMatch {
    artistId: string | null;
    name: string;
    matchedAlias: string;
    snippets: string[];
    imageMatches: ImageMatch[];
    occurrences: number;
}

const LOW_TEXT_THRESHOLD = 200;

export default function ScanEventArtists() {
    const authUser = useSelector((state: RootState) => state.auth.user);
    const isAdmin = authUser?.role === 'admin';
    const [url, setUrl] = useState('');

    const [scanUrlForArtists, { data, loading, error }] = useMutation(SCAN_URL_FOR_ARTISTS);

    if (!isAdmin) return <Navigate to="/" replace />;

    const handleScan = () => {
        if (!url.trim()) return;
        scanUrlForArtists({ variables: { url: url.trim() } }).catch(() => {});
    };

    const result = data?.scanUrlForArtists;
    const matches: ArtistMatch[] = result?.matches ?? [];
    const lowText = !!result && result.scannedTextLength < LOW_TEXT_THRESHOLD;

    return (
        <Box sx={styles.page}>
            <Box sx={styles.inner}>
                <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
                    Admin
                </MonoLabel>
                <Box component="h1" sx={styles.title}>
                    Scan event for artists
                </Box>
                <Box component="p" sx={styles.intro}>
                    Paste an event or convention website's URL to check its page for mentions of artists in the database —
                    both in the visible text and in guest photos whose alt text or filename names the artist (common on
                    sites where names are baked into images rather than typed out). This renders the page in a headless
                    browser first, so it can also see content that loads via JavaScript — scanning can take up to ~20
                    seconds. Results are a review list only; use the existing "Add Artist to Event" page to confirm and
                    add any matches.
                </Box>

                <Box
                    component="form"
                    role="search"
                    noValidate
                    onSubmit={(e: React.FormEvent) => { e.preventDefault(); handleScan(); }}
                    sx={styles.scanBar}
                >
                    <Globe size={18} aria-hidden />
                    <Box
                        component="input"
                        type="url"
                        value={url}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                        placeholder="https://example.com/event-page"
                        aria-label="Event page URL"
                        disabled={loading}
                        sx={styles.scanInput}
                    />
                    <Box
                        component="button"
                        type="submit"
                        disabled={loading || !url.trim()}
                        sx={styles.scanButton}
                    >
                        <MagnifyingGlass size={16} weight="bold" aria-hidden />
                        {loading ? 'Scanning…' : 'Scan'}
                    </Box>
                </Box>

                {loading && (
                    <Box role="status" sx={styles.scanning}>
                        <Box component="span" sx={styles.pulse}><LiveDot /></Box>
                        Rendering the page and checking it against every artist in the database — this can take up to ~20 seconds.
                    </Box>
                )}

                {error && (
                    <Box role="alert" sx={styles.errorNotice}>
                        {error.message}
                    </Box>
                )}

                {result && lowText && (
                    <Box role="status" sx={styles.warnNotice}>
                        Rendered page text looks very short ({result.scannedTextLength} characters) — the site may not have
                        finished rendering, or its content may be behind an interaction (scrolling, clicking) this tool
                        doesn't perform. Consider checking the page manually.
                    </Box>
                )}

                {result && (
                    <Box component="section" aria-labelledby="scan-results">
                        <Box sx={styles.resultsHeader}>
                            <Box component="h2" id="scan-results" sx={styles.resultsTitle}>
                                {matches.length === 0
                                    ? 'No matching artists found'
                                    : `${matches.length} matching artist${matches.length === 1 ? '' : 's'} found`}
                            </Box>
                            <MonoLabel tracking="tight">
                                {(result.scannedTextLength ?? 0).toLocaleString()} characters scanned
                            </MonoLabel>
                        </Box>

                        {matches.length === 0 ? (
                            <Box sx={styles.empty}>
                                Nothing in the database matched the scanned page text.
                            </Box>
                        ) : (
                            <Box component="ul" sx={styles.matchList}>
                                {matches
                                    .slice()
                                    .sort((a, b) => b.occurrences - a.occurrences)
                                    .map((match) => (
                                        <Box component="li" key={match.artistId ?? match.name} sx={styles.match}>
                                            <Box sx={styles.matchHead}>
                                                <Box component="h3" sx={styles.matchName}>{match.name}</Box>
                                                {match.matchedAlias !== match.name && (
                                                    <Box component="span" sx={styles.alias}>
                                                        via "{match.matchedAlias}"
                                                    </Box>
                                                )}
                                                <MonoLabel tracking="tight" sx={styles.occurrences}>
                                                    {match.occurrences} occurrence{match.occurrences === 1 ? '' : 's'}
                                                </MonoLabel>
                                            </Box>

                                            {match.snippets.length > 0 && (
                                                <Box sx={styles.snippets}>
                                                    {match.snippets.map((snippet, i) => (
                                                        <Box component="blockquote" key={i} sx={styles.snippet}>
                                                            "{snippet}"
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}

                                            {match.imageMatches.length > 0 && (
                                                <Box sx={styles.images}>
                                                    {match.imageMatches.map((img, i) => (
                                                        <Box
                                                            component="a"
                                                            key={i}
                                                            href={img.imageUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title={`Matched via image: "${img.matchedText}" — click to view full size`}
                                                            sx={styles.imageLink}
                                                        >
                                                            <Box
                                                                component="img"
                                                                src={img.imageUrl}
                                                                alt={img.matchedText}
                                                                loading="lazy"
                                                                sx={styles.image}
                                                            />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    ))}
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
