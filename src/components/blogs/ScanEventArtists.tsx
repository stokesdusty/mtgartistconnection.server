import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { RootState } from '../../store/store';
import { SCAN_URL_FOR_ARTISTS } from '../graphql/mutations';
import { colors, themeColors, typography, spacing, borderRadius, borders } from '../../styles/design-tokens';

interface ArtistMatch {
    artistId: string | null;
    name: string;
    matchedAlias: string;
    snippets: string[];
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
        <div style={{ padding: spacing.xl, maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{
                fontFamily: typography.fontFamily.heading,
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.normal,
                color: themeColors.text.primary,
                margin: `0 0 ${spacing.sm}`,
            }}>
                Scan Event URL for Artists
            </h1>
            <p style={{
                fontFamily: typography.fontFamily.primary,
                fontSize: typography.fontSize.sm,
                color: themeColors.text.secondary,
                margin: `0 0 ${spacing.xl}`,
            }}>
                Paste an event or convention website's URL to check its page text for mentions of artists in the database.
                This renders the page in a headless browser first, so it can also see content that loads via JavaScript —
                scanning can take up to ~20 seconds. Results are a review list only; use the existing "Add Artist to Event"
                page to confirm and add any matches.
            </p>

            <div style={{ display: 'flex', gap: spacing.sm, marginBottom: spacing.xl }}>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleScan(); }}
                    placeholder="https://example.com/event-page"
                    disabled={loading}
                    style={{
                        flex: 1,
                        padding: `${spacing.sm} ${spacing.md}`,
                        borderRadius: borderRadius.sm,
                        border: borders.thin,
                        fontFamily: typography.fontFamily.primary,
                        fontSize: typography.fontSize.base,
                        color: themeColors.text.primary,
                        background: themeColors.background.paper,
                    }}
                />
                <button
                    onClick={handleScan}
                    disabled={loading || !url.trim()}
                    style={{
                        padding: `${spacing.sm} ${spacing.lg}`,
                        borderRadius: borderRadius.sm,
                        border: 'none',
                        background: themeColors.primary.main,
                        color: colors.primary.contrast,
                        fontFamily: typography.fontFamily.primary,
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.medium,
                        cursor: loading || !url.trim() ? 'default' : 'pointer',
                        opacity: loading || !url.trim() ? 0.6 : 1,
                        whiteSpace: 'nowrap' as const,
                    }}
                >
                    {loading ? 'Scanning…' : 'Scan'}
                </button>
            </div>

            {loading && (
                <div style={{
                    color: themeColors.text.secondary,
                    fontFamily: typography.fontFamily.primary,
                    fontSize: typography.fontSize.sm,
                    marginBottom: spacing.xl,
                }}>
                    Rendering the page and checking it against every artist in the database — this can take up to ~20 seconds.
                </div>
            )}

            {error && (
                <div style={{
                    padding: spacing.lg,
                    marginBottom: spacing.xl,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.accent.red}`,
                    background: themeColors.neutral[50],
                    color: colors.accent.red,
                    fontFamily: typography.fontFamily.primary,
                    fontSize: typography.fontSize.sm,
                }}>
                    {error.message}
                </div>
            )}

            {result && lowText && (
                <div style={{
                    padding: spacing.lg,
                    marginBottom: spacing.xl,
                    borderRadius: borderRadius.md,
                    border: `1px solid ${colors.accent.orange}`,
                    background: colors.accent.orangeLight,
                    color: colors.accent.orangeDark,
                    fontFamily: typography.fontFamily.primary,
                    fontSize: typography.fontSize.sm,
                }}>
                    Rendered page text looks very short ({result.scannedTextLength} characters) — the site may not have
                    finished rendering, or its content may be behind an interaction (scrolling, clicking) this tool
                    doesn't perform. Consider checking the page manually.
                </div>
            )}

            {result && (
                <div>
                    <h2 style={{
                        fontFamily: typography.fontFamily.heading,
                        fontSize: typography.fontSize.xl,
                        fontWeight: typography.fontWeight.medium,
                        color: themeColors.text.primary,
                        margin: `0 0 ${spacing.md}`,
                    }}>
                        {matches.length === 0
                            ? 'No matching artists found'
                            : `${matches.length} matching artist${matches.length === 1 ? '' : 's'} found`}
                    </h2>

                    {matches.length === 0 ? (
                        <div style={{ color: themeColors.text.secondary, fontSize: typography.fontSize.sm }}>
                            Nothing in the database matched the scanned page text.
                        </div>
                    ) : (
                        matches
                            .slice()
                            .sort((a, b) => b.occurrences - a.occurrences)
                            .map((match) => (
                                <div
                                    key={match.artistId ?? match.name}
                                    style={{
                                        background: themeColors.background.paper,
                                        border: borders.thin,
                                        borderRadius: borderRadius.md,
                                        padding: spacing.lg,
                                        marginBottom: spacing.md,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: spacing.sm, marginBottom: spacing.xs }}>
                                        <span style={{
                                            fontFamily: typography.fontFamily.primary,
                                            fontSize: typography.fontSize.base,
                                            fontWeight: typography.fontWeight.semibold,
                                            color: themeColors.text.primary,
                                        }}>
                                            {match.name}
                                        </span>
                                        {match.matchedAlias !== match.name && (
                                            <span style={{
                                                fontFamily: typography.fontFamily.primary,
                                                fontSize: typography.fontSize.xs,
                                                color: themeColors.text.secondary,
                                            }}>
                                                matched via "{match.matchedAlias}"
                                            </span>
                                        )}
                                        <span style={{
                                            fontFamily: typography.fontFamily.primary,
                                            fontSize: typography.fontSize.xs,
                                            color: themeColors.text.secondary,
                                            marginLeft: 'auto',
                                        }}>
                                            {match.occurrences} occurrence{match.occurrences === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                    {match.snippets.map((snippet, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                fontFamily: typography.fontFamily.primary,
                                                fontSize: typography.fontSize.sm,
                                                color: themeColors.text.secondary,
                                                fontStyle: 'italic',
                                                marginTop: spacing.xs,
                                            }}
                                        >
                                            "{snippet}"
                                        </div>
                                    ))}
                                </div>
                            ))
                    )}
                </div>
            )}
        </div>
    );
}
