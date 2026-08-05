import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { RootState } from '../../store/store';
import { GET_CLICK_STATS, GET_TOP_ARTISTS_BY_CLICKS, GET_CLICK_TIMESERIES, GET_PAGE_VIEW_COUNT, GET_PAGE_VIEW_TIMESERIES, GET_TOP_PAGES_BY_VIEWS } from '../graphql/queries';
import { colors, themeColors, typography, spacing, borderRadius, borders } from '../../styles/design-tokens';

type Range = 'today' | '7d' | '30d' | '90d' | 'all';

interface ClickStat { key: string; count: number; }
interface TopArtist { artistName: string; artistId: string | null; count: number; }
interface TimeseriesPoint { date: string; count: number; }

const RANGES: { label: string; value: Range }[] = [
    { label: 'Today', value: 'today' },
    { label: '7d',  value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: 'All', value: 'all' },
];

const PACIFIC_TZ = 'America/Los_Angeles';

// "Today" as a pure calendar date (midnight UTC standing in for the Y/M/D) in Pacific time,
// so range math stays on the same day boundary the backend uses for its Pacific-bucketed stats.
function getPacificToday(): Date {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: PACIFIC_TZ,
        year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '0';
    return new Date(Date.UTC(Number(get('year')), Number(get('month')) - 1, Number(get('day'))));
}

function formatPacificDate(d: Date): string {
    return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

function getRangeLabel(range: Range): string {
    const today = getPacificToday();
    if (range === 'all') return 'All time';
    if (range === 'today') return `${formatPacificDate(today)} (PT)`;
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - (days - 1));
    return `${formatPacificDate(start)} – ${formatPacificDate(today)} (PT)`;
}

function formatChartDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

function Sparkline({ data }: { data: TimeseriesPoint[] }) {
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const max = Math.max(...data.map(p => p.count), 1);

    if (data.length === 0) {
        return <div style={{ color: themeColors.text.secondary, fontSize: typography.fontSize.sm }}>No data</div>;
    }

    const hovered = hoverIndex !== null ? data[hoverIndex] : null;

    return (
        <div style={{ position: 'relative' }}>
            {hovered && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: `${((hoverIndex! + 0.5) / data.length) * 100}%`,
                    transform: 'translate(-50%, -8px)',
                    background: themeColors.primary.dark,
                    color: colors.primary.contrast,
                    borderRadius: borderRadius.sm,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    fontFamily: typography.fontFamily.primary,
                    fontSize: typography.fontSize.xs,
                    whiteSpace: 'nowrap' as const,
                    pointerEvents: 'none' as const,
                    zIndex: 1,
                }}>
                    {formatChartDate(hovered.date)}: {hovered.count.toLocaleString()}
                </div>
            )}
            <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 2,
                height: 80,
            }}>
                {data.map(({ date, count }, i) => (
                    <div
                        key={date}
                        onMouseEnter={() => setHoverIndex(i)}
                        onMouseLeave={() => setHoverIndex(null)}
                        style={{
                            flex: 1,
                            minWidth: 2,
                            height: `${Math.max((count / max) * 100, 2)}%`,
                            background: hoverIndex === i ? themeColors.primary.dark : themeColors.primary.main,
                            opacity: hoverIndex === null || hoverIndex === i ? 1 : 0.6,
                            borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
                            transition: 'height 300ms ease, opacity 150ms ease, background 150ms ease',
                            cursor: 'pointer',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function StatTile({ label, value }: { label: string; value: string }) {
    return (
        <div style={{
            background: themeColors.background.paper,
            border: borders.thin,
            borderRadius: borderRadius.md,
            padding: `${spacing.md} ${spacing.lg}`,
        }}>
            <div style={{
                fontFamily: typography.fontFamily.display,
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.semibold,
                color: themeColors.text.primary,
                marginBottom: spacing.xs,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
            }}>
                {value}
            </div>
            <div style={{
                fontFamily: typography.fontFamily.primary,
                fontSize: typography.fontSize.xs,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                color: themeColors.text.secondary,
            }}>
                {label}
            </div>
        </div>
    );
}

function BarList({ title, stats }: { title: string; stats: ClickStat[] }) {
    const max = Math.max(...stats.map(s => s.count), 1);
    return (
        <div style={{
            background: themeColors.background.paper,
            border: borders.thin,
            borderRadius: borderRadius.md,
            padding: spacing.lg,
        }}>
            <h3 style={{
                fontFamily: typography.fontFamily.heading,
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.medium,
                color: themeColors.text.primary,
                margin: `0 0 ${spacing.md}`,
            }}>
                {title}
            </h3>
            {stats.length === 0 ? (
                <div style={{ color: themeColors.text.secondary, fontSize: typography.fontSize.sm }}>No data</div>
            ) : (
                stats.map(({ key, count }) => (
                    <div key={key} style={{ marginBottom: spacing.sm }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{
                                fontFamily: typography.fontFamily.primary,
                                fontSize: typography.fontSize.sm,
                                color: themeColors.text.primary,
                            }}>
                                {key}
                            </span>
                            <span style={{
                                fontFamily: typography.fontFamily.primary,
                                fontSize: typography.fontSize.sm,
                                color: themeColors.text.secondary,
                            }}>
                                {count.toLocaleString()}
                            </span>
                        </div>
                        <div style={{
                            background: themeColors.neutral[200],
                            borderRadius: borderRadius.full,
                            height: 6,
                        }}>
                            <div style={{
                                width: `${(count / max) * 100}%`,
                                height: '100%',
                                background: themeColors.primary.main,
                                borderRadius: borderRadius.full,
                                transition: 'width 300ms ease',
                            }} />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default function AnalyticsDashboard() {
    const authUser = useSelector((state: RootState) => state.auth.user);
    const isAdmin = authUser?.role === 'admin';
    const [range, setRange] = useState<Range>('30d');

    const rangeVar = range === 'all' ? null : range;

    const { data: vendorData } = useQuery(GET_CLICK_STATS, {
        variables: { range: rangeVar, groupBy: 'vendor' },
        skip: !isAdmin,
    });
    const { data: platformData } = useQuery(GET_CLICK_STATS, {
        variables: { range: rangeVar, groupBy: 'platform' },
        skip: !isAdmin,
    });
    const { data: artistData } = useQuery(GET_TOP_ARTISTS_BY_CLICKS, {
        variables: { range: rangeVar, limit: 10 },
        skip: !isAdmin,
    });
    const { data: timeseriesData } = useQuery(GET_CLICK_TIMESERIES, {
        variables: { range: rangeVar },
        skip: !isAdmin,
    });
    const { data: pageViewCountData } = useQuery(GET_PAGE_VIEW_COUNT, {
        variables: { range: rangeVar },
        skip: !isAdmin,
    });
    const { data: pageViewTimeseriesData } = useQuery(GET_PAGE_VIEW_TIMESERIES, {
        variables: { range: rangeVar },
        skip: !isAdmin,
    });
    const { data: topPagesData } = useQuery(GET_TOP_PAGES_BY_VIEWS, {
        variables: { range: rangeVar, limit: 10 },
        skip: !isAdmin,
    });

    if (!isAdmin) return <Navigate to="/" replace />;

    const vendorStats: ClickStat[]         = vendorData?.clickStats ?? [];
    const platformStats: ClickStat[]       = platformData?.clickStats ?? [];
    const topArtists: TopArtist[]          = artistData?.topArtistsByClicks ?? [];
    const timeseries: TimeseriesPoint[]    = timeseriesData?.clickTimeseries ?? [];
    const topPages: ClickStat[]            = topPagesData?.topPagesByViews ?? [];
    const pageViewTimeseries: TimeseriesPoint[] = pageViewTimeseriesData?.pageViewTimeseries ?? [];

    const totalPriceClicks    = vendorStats.reduce((s, r) => s + r.count, 0);
    const totalOutboundClicks = platformStats.reduce((s, r) => s + r.count, 0);
    const totalPageViews      = pageViewCountData?.pageViewCount ?? 0;
    const topVendor           = vendorStats[0]?.key ?? '—';
    const topArtistName       = topArtists[0]?.artistName ?? '—';

    return (
        <div style={{ padding: spacing.xl, maxWidth: 1100, margin: '0 auto' }}>

            <h1 style={{
                fontFamily: typography.fontFamily.heading,
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.normal,
                color: themeColors.text.primary,
                margin: `0 0 ${spacing.xl}`,
            }}>
                Click Analytics
            </h1>

            {/* Range switch */}
            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl, flexWrap: 'wrap' as const }}>
                <div style={{ display: 'flex', gap: spacing.xs }}>
                    {RANGES.map(({ label, value }) => {
                        const active = range === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setRange(value)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: borderRadius.full,
                                    border: `1px solid ${active ? themeColors.primary.main : themeColors.neutral[300]}`,
                                    background: active ? themeColors.primary.main : 'transparent',
                                    color: active ? colors.primary.contrast : themeColors.text.secondary,
                                    cursor: 'pointer',
                                    fontFamily: typography.fontFamily.primary,
                                    fontSize: typography.fontSize.sm,
                                    fontWeight: active ? typography.fontWeight.medium : typography.fontWeight.normal,
                                    transition: 'all 150ms ease',
                                }}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
                <span style={{
                    fontFamily: typography.fontFamily.primary,
                    fontSize: typography.fontSize.sm,
                    color: themeColors.text.secondary,
                }}>
                    {getRangeLabel(range)}
                </span>
            </div>

            {/* Stat tiles */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: spacing.md,
                marginBottom: spacing.xl,
            }}>
                <StatTile label="Page loads"       value={totalPageViews.toLocaleString()} />
                <StatTile label="Outbound clicks"  value={totalOutboundClicks.toLocaleString()} />
                <StatTile label="Price clicks"     value={totalPriceClicks.toLocaleString()} />
                <StatTile label="Top vendor"       value={topVendor} />
                <StatTile label="Top artist"       value={topArtistName} />
            </div>

            {/* Bar lists */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: spacing.xl,
                marginBottom: spacing.xl,
            }}>
                <BarList title="Top pages by loads"      stats={topPages} />
                <BarList title="Price clicks by vendor"  stats={vendorStats} />
                <BarList title="Outbound by platform"    stats={platformStats} />
            </div>

            {/* Top artists table */}
            <div style={{
                background: themeColors.background.paper,
                border: borders.thin,
                borderRadius: borderRadius.md,
                padding: spacing.lg,
                marginBottom: spacing.xl,
            }}>
                <h3 style={{
                    fontFamily: typography.fontFamily.heading,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.medium,
                    color: themeColors.text.primary,
                    margin: `0 0 ${spacing.md}`,
                }}>
                    Top artists by clicks
                </h3>
                {topArtists.length === 0 ? (
                    <div style={{ color: themeColors.text.secondary, fontSize: typography.fontSize.sm }}>No data</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['#', 'Artist', 'Clicks'].map(h => (
                                    <th key={h} style={{
                                        textAlign: 'left',
                                        padding: `${spacing.xs} ${spacing.sm}`,
                                        fontFamily: typography.fontFamily.primary,
                                        fontSize: typography.fontSize.xs,
                                        textTransform: 'uppercase' as const,
                                        letterSpacing: '0.08em',
                                        color: themeColors.text.secondary,
                                        borderBottom: `1px solid ${themeColors.neutral[200]}`,
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topArtists.map(({ artistName, count }, i) => (
                                <tr
                                    key={artistName}
                                    style={{ borderBottom: `1px solid ${themeColors.neutral[200]}` }}
                                >
                                    <td style={{
                                        padding: `${spacing.xs} ${spacing.sm}`,
                                        fontFamily: typography.fontFamily.primary,
                                        fontSize: typography.fontSize.sm,
                                        color: themeColors.text.secondary,
                                        width: 40,
                                    }}>
                                        {i + 1}
                                    </td>
                                    <td style={{
                                        padding: `${spacing.xs} ${spacing.sm}`,
                                        fontFamily: typography.fontFamily.primary,
                                        fontSize: typography.fontSize.sm,
                                    }}>
                                        <Link
                                            to={`/artist/${encodeURIComponent(artistName)}`}
                                            style={{ color: themeColors.primary.main, textDecoration: 'none' }}
                                        >
                                            {artistName}
                                        </Link>
                                    </td>
                                    <td style={{
                                        padding: `${spacing.xs} ${spacing.sm}`,
                                        fontFamily: typography.fontFamily.primary,
                                        fontSize: typography.fontSize.sm,
                                        fontWeight: typography.fontWeight.medium,
                                        color: themeColors.text.primary,
                                    }}>
                                        {count.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Daily page loads sparkline */}
            <div style={{
                background: themeColors.background.paper,
                border: borders.thin,
                borderRadius: borderRadius.md,
                padding: spacing.lg,
                marginBottom: spacing.xl,
            }}>
                <h3 style={{
                    fontFamily: typography.fontFamily.heading,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.medium,
                    color: themeColors.text.primary,
                    margin: `0 0 ${spacing.xs}`,
                }}>
                    Daily page loads
                </h3>
                <p style={{
                    fontFamily: typography.fontFamily.primary,
                    fontSize: typography.fontSize.xs,
                    color: themeColors.text.secondary,
                    margin: `0 0 ${spacing.md}`,
                }}>
                    Every page navigation on the site, logged first-party (independent of Google Analytics/cookie consent).
                </p>
                <Sparkline data={pageViewTimeseries} />
            </div>

            {/* Daily sparkline */}
            <div style={{
                background: themeColors.background.paper,
                border: borders.thin,
                borderRadius: borderRadius.md,
                padding: spacing.lg,
            }}>
                <h3 style={{
                    fontFamily: typography.fontFamily.heading,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.medium,
                    color: themeColors.text.primary,
                    margin: `0 0 ${spacing.xs}`,
                }}>
                    Daily clicks
                </h3>
                <p style={{
                    fontFamily: typography.fontFamily.primary,
                    fontSize: typography.fontSize.xs,
                    color: themeColors.text.secondary,
                    margin: `0 0 ${spacing.md}`,
                }}>
                    Price-comparison vendor clicks plus outbound artist link clicks (social, store, etc.), combined.
                </p>
                <Sparkline data={timeseries} />
            </div>

        </div>
    );
}
