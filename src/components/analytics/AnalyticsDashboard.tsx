import { KeyboardEvent, ReactNode, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { Box } from '@mui/material';
import { RootState } from '../../store/store';
import { GET_CLICK_STATS, GET_TOP_ARTISTS_BY_CLICKS, GET_CLICK_TIMESERIES, GET_PAGE_VIEW_COUNT, GET_PAGE_VIEW_TIMESERIES, GET_TOP_PAGES_BY_VIEWS } from '../graphql/queries';
import { analyticsStyles as styles } from '../../styles/analytics-styles';
import MonoLabel from '../shared/MonoLabel';
import SegmentedControl, { SegmentOption } from '../shared/SegmentedControl';

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

const RANGE_OPTIONS: SegmentOption<Range>[] = RANGES.map(({ label, value }) => ({ label, value }));

const PACIFIC_TZ = 'America/Los_Angeles';

const srOnly = {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
} as const;

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

function formatAxisDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** Round up to a clean axis maximum: 1, 2, 2.5, 5 or 10 × 10ⁿ. */
function niceMax(value: number): number {
    if (value <= 1) return 1;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const step = [1, 2, 2.5, 5, 10].find(s => s * magnitude >= value) ?? 10;
    return step * magnitude;
}

/** 1,284 / 12.9K / 4.2M — for stat tiles. */
function compact(n: number): string {
    return n < 10000
        ? n.toLocaleString()
        : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

// ── Charts ─────────────────────────────────────────────────────────────────────

/** Single-series daily column chart with a hover/keyboard tooltip and a table view. */
function ColumnChart({ data, label }: { data: TimeseriesPoint[]; label: string }) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    if (data.length === 0) {
        return <Box sx={styles.noData}>No data</Box>;
    }

    const axisMax = niceMax(Math.max(...data.map(p => p.count)));
    const active = activeIndex !== null ? data[activeIndex] : null;

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const last = data.length - 1;
        const current = activeIndex ?? (e.key === 'ArrowLeft' || e.key === 'End' ? last + 1 : -1);
        const next =
            e.key === 'ArrowRight' ? Math.min(current + 1, last)
            : e.key === 'ArrowLeft' ? Math.max(current - 1, 0)
            : e.key === 'Home' ? 0
            : e.key === 'End' ? last
            : null;
        if (next === null) return;
        e.preventDefault();
        setActiveIndex(next);
    };

    return (
        <>
            <Box sx={styles.chartWrap}>
                <Box sx={styles.yAxis} aria-hidden>
                    <span>{axisMax.toLocaleString()}</span>
                    <span>0</span>
                </Box>
                <Box
                    role="group"
                    tabIndex={0}
                    aria-label={`${label} chart. Use the arrow keys to read each day.`}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setActiveIndex(null)}
                    onMouseLeave={() => setActiveIndex(null)}
                    sx={styles.plot}
                >
                    {data.map(({ date, count }, i) => (
                        <Box
                            key={date}
                            onMouseEnter={() => setActiveIndex(i)}
                            sx={[styles.slot, activeIndex === i ? styles.slotActive : {}]}
                        >
                            <Box
                                sx={[
                                    styles.bar,
                                    { height: `${(count / axisMax) * 100}%` },
                                    activeIndex !== null && activeIndex !== i ? styles.barDimmed : {},
                                ]}
                            />
                        </Box>
                    ))}

                    {active && (
                        <Box sx={[styles.tooltip, { left: `${((activeIndex! + 0.5) / data.length) * 100}%` }]} aria-hidden>
                            <Box sx={styles.tooltipDate}>{formatChartDate(active.date)}</Box>
                            <Box sx={styles.tooltipValue}>{active.count.toLocaleString()}</Box>
                        </Box>
                    )}
                    <Box component="span" aria-live="polite" sx={srOnly}>
                        {active ? `${formatChartDate(active.date)}: ${active.count.toLocaleString()}` : ''}
                    </Box>
                </Box>
                <Box sx={styles.xAxis} aria-hidden>
                    <span>{formatAxisDate(data[0].date)}</span>
                    {data.length > 1 && <span>{formatAxisDate(data[data.length - 1].date)}</span>}
                </Box>
            </Box>

            <Box component="details" sx={styles.tableToggle}>
                <summary>Show as table</summary>
                <Box sx={styles.tableScroll}>
                    <Box component="table" sx={[styles.table, { mt: 0 }]}>
                        <thead>
                            <tr>
                                <th scope="col">Date</th>
                                <th scope="col" className="num">{label}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(({ date, count }) => (
                                <tr key={date}>
                                    <td>{formatChartDate(date)}</td>
                                    <td className="num">{count.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

function StatTile({ label, value, text = false }: { label: string; value: string; text?: boolean }) {
    return (
        <Box sx={styles.tile}>
            <Box component="span" title={value} sx={[styles.tileValue, text ? styles.tileValueText : {}]}>
                {value}
            </Box>
            <MonoLabel tracking="tight">{label}</MonoLabel>
        </Box>
    );
}

function Panel({ title, note, aside, children }: { title: string; note?: string; aside?: ReactNode; children: ReactNode }) {
    return (
        <Box component="section" sx={styles.panel}>
            <Box sx={styles.panelHeader}>
                <Box component="h2" sx={styles.panelTitle}>{title}</Box>
                {aside}
            </Box>
            {note && <Box component="p" sx={styles.panelNote}>{note}</Box>}
            {children}
        </Box>
    );
}

function TimeseriesPanel({ title, note, data }: { title: string; note: string; data: TimeseriesPoint[] }) {
    const total = data.reduce((s, p) => s + p.count, 0);
    const peak = data.reduce<TimeseriesPoint | null>((best, p) => (!best || p.count > best.count ? p : best), null);
    return (
        <Panel
            title={title}
            note={note}
            aside={data.length > 0 && (
                <MonoLabel tracking="tight" sx={styles.peak}>
                    {total.toLocaleString()} total
                    {peak && peak.count > 0 && ` · peak ${peak.count.toLocaleString()} on ${formatAxisDate(peak.date)}`}
                </MonoLabel>
            )}
        >
            <ColumnChart data={data} label={title} />
        </Panel>
    );
}

function BarList({ title, stats }: { title: string; stats: ClickStat[] }) {
    const max = Math.max(...stats.map(s => s.count), 1);
    return (
        <Panel title={title}>
            {stats.length === 0 ? (
                <Box sx={styles.noData}>No data</Box>
            ) : (
                <Box component="ul" sx={styles.barList}>
                    {stats.map(({ key, count }) => (
                        <li key={key}>
                            <Box sx={styles.barRowHead}>
                                <Box component="span" title={key} sx={styles.barLabel}>{key}</Box>
                                <Box component="span" sx={styles.barCount}>{count.toLocaleString()}</Box>
                            </Box>
                            <Box sx={styles.track} aria-hidden>
                                <Box sx={[styles.fill, { width: `${(count / max) * 100}%` }]} />
                            </Box>
                        </li>
                    ))}
                </Box>
            )}
        </Panel>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────

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
        <Box sx={styles.page}>
            <Box sx={styles.inner}>

                {/* Header + range switch */}
                <Box sx={styles.hero}>
                    <Box>
                        <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
                            Admin
                        </MonoLabel>
                        <Box component="h1" sx={styles.title}>Analytics</Box>
                        <MonoLabel tracking="tight" uppercase={false} size={12} sx={styles.rangeLabel}>
                            {getRangeLabel(range)}
                        </MonoLabel>
                    </Box>
                    <SegmentedControl
                        options={RANGE_OPTIONS}
                        value={range}
                        onChange={setRange}
                        aria-label="Date range"
                    />
                </Box>

                {/* Stat tiles */}
                <Box sx={styles.tiles}>
                    <StatTile label="Page loads"      value={compact(totalPageViews)} />
                    <StatTile label="Outbound clicks" value={compact(totalOutboundClicks)} />
                    <StatTile label="Price clicks"    value={compact(totalPriceClicks)} />
                    <StatTile label="Top vendor"      value={topVendor} text />
                    <StatTile label="Top artist"      value={topArtistName} text />
                </Box>

                <Box sx={styles.stack}>
                    <TimeseriesPanel
                        title="Daily page loads"
                        note="Every page navigation on the site, logged first-party (independent of Google Analytics/cookie consent)."
                        data={pageViewTimeseries}
                    />
                    <TimeseriesPanel
                        title="Daily clicks"
                        note="Price-comparison vendor clicks plus outbound artist link clicks (social, store, etc.), combined."
                        data={timeseries}
                    />

                    <Box sx={styles.threeUp}>
                        <BarList title="Top pages by loads"     stats={topPages} />
                        <BarList title="Price clicks by vendor" stats={vendorStats} />
                        <BarList title="Outbound by platform"   stats={platformStats} />
                    </Box>

                    <Panel title="Top artists by clicks">
                        {topArtists.length === 0 ? (
                            <Box sx={styles.noData}>No data</Box>
                        ) : (
                            <Box component="table" sx={styles.table}>
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Artist</th>
                                        <th scope="col" className="num">Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topArtists.map(({ artistName, count }, i) => (
                                        <tr key={artistName}>
                                            <td className="rank">{i + 1}</td>
                                            <td>
                                                <Link to={`/artist/${encodeURIComponent(artistName)}`}>
                                                    {artistName}
                                                </Link>
                                            </td>
                                            <td className="num">{count.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Box>
                        )}
                    </Panel>
                </Box>

            </Box>
        </Box>
    );
}
