import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { RootState } from '../../store/store';
import { GET_CLICK_STATS, GET_TOP_ARTISTS_BY_CLICKS, GET_CLICK_TIMESERIES } from '../graphql/queries';
import { colors, themeColors, typography, spacing, borderRadius, borders } from '../../styles/design-tokens';

type Range = '7d' | '30d' | '90d' | 'all';

interface ClickStat { key: string; count: number; }
interface TopArtist { artistName: string; artistId: string | null; count: number; }
interface TimeseriesPoint { date: string; count: number; }

const RANGES: { label: string; value: Range }[] = [
    { label: '7d',  value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: 'All', value: 'all' },
];

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
                            background: colors.neutral[200],
                            borderRadius: borderRadius.full,
                            height: 6,
                        }}>
                            <div style={{
                                width: `${(count / max) * 100}%`,
                                height: '100%',
                                background: colors.primary.main,
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

    if (!isAdmin) return <Navigate to="/" replace />;

    const vendorStats: ClickStat[]         = vendorData?.clickStats ?? [];
    const platformStats: ClickStat[]       = platformData?.clickStats ?? [];
    const topArtists: TopArtist[]          = artistData?.topArtistsByClicks ?? [];
    const timeseries: TimeseriesPoint[]    = timeseriesData?.clickTimeseries ?? [];

    const totalPriceClicks    = vendorStats.reduce((s, r) => s + r.count, 0);
    const totalOutboundClicks = platformStats.reduce((s, r) => s + r.count, 0);
    const topVendor           = vendorStats[0]?.key ?? '—';
    const topArtistName       = topArtists[0]?.artistName ?? '—';

    const maxTimeseries = Math.max(...timeseries.map(p => p.count), 1);

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
            <div style={{ display: 'flex', gap: spacing.xs, marginBottom: spacing.xl }}>
                {RANGES.map(({ label, value }) => {
                    const active = range === value;
                    return (
                        <button
                            key={value}
                            onClick={() => setRange(value)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: borderRadius.full,
                                border: `1px solid ${active ? colors.primary.main : colors.neutral[300]}`,
                                background: active ? colors.primary.main : 'transparent',
                                color: active ? colors.primary.contrast : colors.text.secondary,
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

            {/* Stat tiles */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: spacing.md,
                marginBottom: spacing.xl,
            }}>
                <StatTile label="Outbound clicks"  value={totalOutboundClicks.toLocaleString()} />
                <StatTile label="Price clicks"     value={totalPriceClicks.toLocaleString()} />
                <StatTile label="Top vendor"       value={topVendor} />
                <StatTile label="Top artist"       value={topArtistName} />
            </div>

            {/* Bar lists */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: spacing.xl,
                marginBottom: spacing.xl,
            }}>
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
                                        color: colors.text.secondary,
                                        borderBottom: borders.thin,
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
                                    style={{ borderBottom: `1px solid ${colors.neutral[200]}` }}
                                >
                                    <td style={{
                                        padding: `${spacing.xs} ${spacing.sm}`,
                                        fontFamily: typography.fontFamily.primary,
                                        fontSize: typography.fontSize.sm,
                                        color: colors.text.secondary,
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
                                            style={{ color: colors.primary.main, textDecoration: 'none' }}
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
                    margin: `0 0 ${spacing.md}`,
                }}>
                    Daily clicks
                </h3>
                {timeseries.length === 0 ? (
                    <div style={{ color: themeColors.text.secondary, fontSize: typography.fontSize.sm }}>No data</div>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: 2,
                        height: 80,
                    }}>
                        {timeseries.map(({ date, count }) => (
                            <div
                                key={date}
                                title={`${date}: ${count.toLocaleString()}`}
                                style={{
                                    flex: 1,
                                    minWidth: 2,
                                    height: `${Math.max((count / maxTimeseries) * 100, 2)}%`,
                                    background: colors.primary.main,
                                    borderRadius: `${borderRadius.sm} ${borderRadius.sm} 0 0`,
                                    transition: 'height 300ms ease',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
