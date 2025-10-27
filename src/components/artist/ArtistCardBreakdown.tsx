import { Box, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLoading } from '../../LoadingContext'; // Import the useLoading hook
import { useNavigate } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

interface Card {
    related_uris: {
        gatherer: string;
    };
    id: string;
    image_uris?: {
        border_crop: string;
    };
    card_faces?: {
        image_uris?: {
            normal: string;
        };
    }[];
    cmc: number;
    type_line: string;
    name: string;
    artist: string;
    colors?: string[]; // colors is now optional
    set_name: string;
    oracle_text: string;
    rarity: string;
    mana_cost: string;
}

interface ScryfallResponse {
    data: Card[];
    has_more: boolean;
    next_page?: string;
    total_cards: number;
}

interface ManaCostData {
    cmc: number;
    count: number;
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

const ArtistCardAnalysis = () => {
    const { name: artist } = useParams<{ name?: string }>();
    const [isFetching, setIsFetching] = useState(false);
    const { setIsLoading } = useLoading(); // Get the setIsLoading function from the context
    const [error, setError] = useState<string | null>(null);
    const [cardsWithDupes, setCardsWithDupes] = useState<Card[]>([]);
    const [hasTriedBothQueries, setHasTriedBothQueries] = useState(false);

    const navigate = useNavigate();
    useEffect(() => {
        if (!artist) {
            navigate("/");
        }
    }, [artist, navigate]);

    useEffect(() => {
        if (artist) {
            document.title = `MtG Artist Connection - ${artist} Card Breakdown`;
        }
    }, [artist]);

    const formattedArtistName = useMemo(() => {
        return artist?.split(" ").join(" ") || "";
    }, [artist]);

    const scryfallQuery = useMemo(() => {
        if (!formattedArtistName) return { withPaper: "", withoutPaper: "" };
        const baseQuery = "artist%3A";
        const formattedQuery = `${baseQuery}"${formattedArtistName}"`;
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

            // Try with game:paper filter first
            let withDupesData = await fetchCards(scryfallQuery.withPaper);

            // If we got null (404 error), try without game:paper filter
            if (!withDupesData) {
                console.log("No results with game:paper, retrying without filter...");
                setError(null); // Clear the error before retrying
                withDupesData = await fetchCards(scryfallQuery.withoutPaper);
                setHasTriedBothQueries(true);
            }

            if (withDupesData) {
                // Case-insensitive exact artist filter
                const filtered = withDupesData.filter(
                    (card) => card.artist?.toLowerCase().trim() === artist.toLowerCase().trim()
                );
                setCardsWithDupes(filtered);
            } else if (hasTriedBothQueries) {
                // If we've tried both queries and still have no data, set a user-friendly error
                setError("No cards found");
            }
        };
        fetchData();
    }, [scryfallQuery, fetchCards, artist]);

    // Function to extract the main card type
    const getMainCardType = (typeLine: string) => {
        // Check if typeLine is undefined or null
        if (!typeLine) {
            return 'Unknown';
        }
        
        // Extract the main type (before the —)
        const mainTypePart = typeLine.split('—')[0].trim();

        // Check for common main types
        if (mainTypePart.includes('Creature')) return 'Creature';
        if (mainTypePart.includes('Instant')) return 'Instant';
        if (mainTypePart.includes('Sorcery')) return 'Sorcery';
        if (mainTypePart.includes('Artifact')) return 'Artifact';
        if (mainTypePart.includes('Enchantment')) return 'Enchantment';
        if (mainTypePart.includes('Land')) return 'Land';
        if (mainTypePart.includes('Planeswalker')) return 'Planeswalker';

        // Return the full main type if it doesn't match common patterns
        return mainTypePart;
    };

    // Get creature type distribution
    const getCreatureType = (typeLine: string) => {
        if (!typeLine) {
            return null;
        }
        
        const parts = typeLine.split('—');
        if (parts.length > 1 && parts[0].trim().includes('Creature')) {
            return parts[1].trim();
        }
        return null;
    };

    // Process mana cost distribution
    const manaCostDist: { [key: number]: number } = {} as { [key: number]: number };
    cardsWithDupes.forEach(card => {
        const cmc = card.cmc;
        manaCostDist[cmc] = (manaCostDist[cmc] || 0) + 1;
    });

    // Process card type distribution
    const typeDist: { [key: string]: number } = {};
    cardsWithDupes.forEach((card) => {
        if (card && card.type_line) {
            const mainType = getMainCardType(card.type_line);
            typeDist[mainType] = (typeDist[mainType] || 0) + 1;
        }
    });

    // Process creature type distribution
    const creatureTypeDist: { [key: string]: number } = {};
    cardsWithDupes.forEach((card) => {
        if (card && card.type_line) {
            const creatureType = getCreatureType(card.type_line);
            if (creatureType) {
                creatureType.split(' ').forEach((type) => {
                    creatureTypeDist[type] = (creatureTypeDist[type] || 0) + 1;
                });
            }
        }
    });

    // Process rarity distribution
    const rarityDist: { [key: string]: number } = {} as { [key: string]: number };
    cardsWithDupes.forEach((card) => {
        const rarity = card.rarity;
        rarityDist[rarity] = (rarityDist[rarity] || 0) + 1;
    });

    // Process color distribution
    const colorDist: { [key: string]: number } = {} as { [key: string]: number };
    const colorNames = {
        'W': 'White',
        'U': 'Blue',
        'B': 'Black',
        'R': 'Red',
        'G': 'Green'
    };

    cardsWithDupes.forEach((card) => {
        if (card.colors && card.colors.length > 0) {
            card.colors.forEach(color => {
                colorDist[color] = (colorDist[color] || 0) + 1;
            });
        } else {
            // For colorless cards
            colorDist['C'] = (colorDist['C'] || 0) + 1;
        }
    });

    // Process set distribution
    const setDist: { [key: string]: number } = {} as { [key: string]: number };
    cardsWithDupes.forEach((card) => {
        const set = card.set_name;
        setDist[set] = (setDist[set] || 0) + 1;
    });

    // Convert distributions to array format for charts
    const manaCostData: ManaCostData[] = Object.entries(manaCostDist).map(([cmc, count]) => ({
        cmc: Number(cmc),
        count
    })).sort((a, b) => a.cmc - b.cmc);

    const typeData: TypeData[] = Object.entries(typeDist).map(([type, count]) => ({
        type,
        count
    }));

    const creatureTypeData: TypeData[] = Object.entries(creatureTypeDist).map(([type, count]) => ({
        type,
        count
    })).sort((a, b) => (b.count as number) - (a.count as number));

    const colorData: ColorData[] = Object.entries(colorDist).map(([color, count]) => ({
        color,
        fullName: colorNames[color as keyof typeof colorNames] || (color === 'C' ? 'Colorless' : color),
        count
    }));

    const setData: SetData[] = Object.entries(setDist).map(([set, count]) => ({
        set,
        count
    })).sort((a, b) => b.count - a.count);

    // Colors for the charts
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
    const COLOR_MAP = {
        'W': '#F8F6D8', // White
        'U': '#0E68AB', // Blue
        'B': '#A69F9D', // Black (using gray since black may not be visible)
        'R': '#D3202A', // Red
        'G': '#00733E', // Green
        'common': '#1a1718',
        'uncommon': '#707883',
        'rare': '#a58e4a',
        'mythic': '#bf4427'
    };

    // Calculate some statistics
    const avgCmc = cardsWithDupes.length > 0
        ? cardsWithDupes.reduce((sum, card) => sum + card.cmc, 0) / cardsWithDupes.length
        : 0;
    const mostCommonType = typeData.length > 0
        ? typeData.sort((a, b) => (b.count as number) - (a.count as number))[0]?.type || 'N/A'
        : 'N/A';
    const mostCommonColor = colorData.length > 0
        ? colorData.sort((a, b) => (b.count as number) - (a.count as number))[0]?.fullName || 'N/A'
        : 'N/A';

    const styles = {
        outerContainer: {
            background: "linear-gradient(135deg, #507A60 0%, #3c5c48 50%, #2d4a36 100%)",
            minHeight: "100vh",
            padding: { xs: 3, md: 6 },
            position: "relative",
            "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)",
                pointerEvents: "none",
            },
        },
        container: {
            maxWidth: 1200,
            margin: "0 auto",
            padding: { xs: 2, md: 3 },
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(30px) saturate(1.2)",
            borderRadius: 4,
            boxShadow: "0 32px 80px rgba(0,0,0,0.12), 0 16px 40px rgba(80, 122, 96, 0.15), inset 0 1px 0 rgba(255,255,255,0.9)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            position: "relative",
            zIndex: 1,
        },
        pageTitle: {
            background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 800,
            fontSize: { xs: "2rem", md: "2.8rem" },
            marginBottom: 1.5,
            textAlign: "center",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        },
        artistTitle: {
            background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 600,
            fontSize: { xs: "1.3rem", md: "1.6rem" },
            marginBottom: 3,
            textAlign: "center",
            fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
        },
        chartCard: {
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(20px) saturate(1.1)",
            borderRadius: 3,
            padding: 2.5,
            boxShadow: "0 12px 32px rgba(0,0,0,0.06), 0 6px 16px rgba(80, 122, 96, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            transition: "all 0.3s ease",
            "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 16px 40px rgba(0,0,0,0.08), 0 8px 20px rgba(80, 122, 96, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
            },
        },
        chartTitle: {
            background: "linear-gradient(135deg, #507A60 0%, #6b9d73 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: 700,
            fontSize: "1.4rem",
            marginBottom: 2.5,
            fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
            letterSpacing: "-0.01em",
            position: "relative",
            "&::after": {
                content: '""',
                position: "absolute",
                bottom: "-8px",
                left: 0,
                width: "50px",
                height: "2px",
                background: "linear-gradient(90deg, #507A60, #6b9d73, transparent)",
                borderRadius: "1px",
            },
        },
        gridContainer: {
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
            gap: 3,
            marginBottom: 4,
        },
        loadingContainer: {
            background: "linear-gradient(135deg, #507A60 0%, #3c5c48 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            position: "relative",
            "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
            },
            "& .MuiCircularProgress-root": {
                color: "white",
                zIndex: 1,
            },
        },
        errorMessage: {
            color: "#d32f2f",
            textAlign: "center",
            padding: 4,
            background: "linear-gradient(135deg, rgba(211, 47, 47, 0.08) 0%, rgba(211, 47, 47, 0.12) 100%)",
            borderRadius: 3,
            border: "1px solid rgba(211, 47, 47, 0.2)",
            backdropFilter: "blur(10px)",
            fontSize: "1.1rem",
            fontWeight: 500,
        },
    };

    if (isFetching) {
        return (
            <Box sx={styles.loadingContainer}>
              <CircularProgress size={60} />
            </Box>
          );
    }
    if(error) {
        return (
            <Box sx={styles.outerContainer}>
                <Box sx={styles.container}>
                    <Typography sx={styles.errorMessage}>
                        {error === "No cards found" ? `No cards found for ${artist}` : `Error loading cards: ${error}`}
                    </Typography>
                </Box>
            </Box>
          );
    }
    if (!cardsWithDupes || cardsWithDupes.length === 0) {
        return (
            <Box sx={styles.outerContainer}>
                <Box sx={styles.container}>
                    <Typography sx={styles.errorMessage}>
                        No cards found for {artist}
                    </Typography>
                </Box>
            </Box>
          );
    }
    return (
        <Box sx={styles.outerContainer}>
            <Box sx={styles.container}>
                <Typography sx={styles.pageTitle}>
                    MTG Card Analysis Dashboard
                </Typography>
                <Typography sx={styles.artistTitle}>
                    Artist: {cardsWithDupes.length > 0 ? cardsWithDupes[0].artist : artist}
                </Typography>
    
                <Box sx={styles.gridContainer}>
                    {/* Mana Cost Distribution */}
                    <Box sx={styles.chartCard}>
                        <Typography sx={styles.chartTitle}>Mana Cost Distribution</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={manaCostData} margin={{ top: 20, right: 10, left: 0, bottom: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="cmc" 
                                    label={{ value: 'Converted Mana Cost', position: 'insideBottom', offset: -10, fill: '#666' }} 
                                    tick={{ fill: '#666' }}
                                    axisLine={{ stroke: '#ccc' }}
                                />
                                <YAxis 
                                    label={{ value: 'Number of Cards', angle: -90, position: 'insideLeft', offset: 5, fill: '#666' }} 
                                    tick={{ fill: '#666' }}
                                    axisLine={{ stroke: '#ccc' }}
                                />
                                <Tooltip 
                                    formatter={(value) => [`${value} cards`, 'Count']}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '4px', border: '1px solid #ddd' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#333' }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    name="Cards" 
                                    radius={[4, 4, 0, 0]}
                                    fill="url(#manaCostGradient)"
                                    animationDuration={1500}
                                />
                                <defs>
                                    <linearGradient id="manaCostGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
    
                    {/* Card Type Distribution */}
                    <Box sx={styles.chartCard}>
                        <Typography sx={styles.chartTitle}>Card Type Distribution</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="type"
                                    paddingAngle={3}
                                    animationDuration={1500}
                                    animationBegin={300}
                                    label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: '#ccc', strokeWidth: 1 }}
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[index % COLORS.length]} 
                                            stroke="#fff"
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name) => {
                                        const numValue = Number(value);
                                        const percentage = isNaN(numValue) ? 0 : ((numValue / cardsWithDupes.length) * 100).toFixed(1);
                                        return [`${value} cards (${percentage}%)`, name];
                                    }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '4px', border: '1px solid #ddd' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#333' }}
                                />
                                <Legend 
                                    layout="horizontal" 
                                    verticalAlign="bottom" 
                                    align="center"
                                    iconSize={8}
                                    iconType="circle"
                                    formatter={(value) => <span style={{ color: '#666', fontSize: '0.8rem' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
    
                    {/* Color Distribution */}
                    <Box sx={styles.chartCard}>
                        <Typography sx={styles.chartTitle}>Color Distribution</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={colorData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="fullName" 
                                    tick={{ fill: '#666', fontSize: '0.7rem' }}
                                    axisLine={{ stroke: '#ccc' }}
                                />
                                <YAxis 
                                    tick={{ fill: '#666' }}
                                    axisLine={{ stroke: '#ccc' }}
                                />
                                <Tooltip 
                                    formatter={(value) => [`${value} cards`, 'Count']}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '4px', border: '1px solid #ddd' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#333' }}
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
                                            stroke="#fff"
                                            strokeWidth={1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
    
                    {/* Set Distribution */}
                    <Box sx={styles.chartCard}>
                        <Typography sx={styles.chartTitle}>Set Distribution (Top 10)</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart 
                                data={setData.slice(0, 10)} 
                                layout="vertical" 
                                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                                <XAxis 
                                    type="number" 
                                    tick={{ fill: '#666' }}
                                    axisLine={{ stroke: '#ccc' }}
                                />
                                <YAxis 
                                    dataKey="set" 
                                    type="category" 
                                    tick={{ fill: '#666', fontSize: '0.75rem' }}
                                    axisLine={{ stroke: '#ccc' }}
                                    width={70}
                                />
                                <Tooltip 
                                    formatter={(value) => [`${value} cards`, 'Count']}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '4px', border: '1px solid #ddd' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#333' }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    fill="url(#setGradient)" 
                                    radius={[0, 4, 4, 0]}
                                    animationDuration={1500}
                                />
                                <defs>
                                    <linearGradient id="setGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#FFBB28" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </Box>
    
                {/* Card List */}
                <Box sx={{ ...styles.chartCard, marginTop: 4 }}>
                    <Typography sx={styles.chartTitle}>Card Details</Typography>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Box component="table" sx={{ 
                            minWidth: '100%', 
                            background: 'white', 
                            fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, 
                            borderCollapse: 'collapse', 
                            border: '1px solid #e5e7eb',
                            borderRadius: 2,
                            overflow: 'hidden'
                        }}>
                            <Box component="thead" sx={{ background: 'rgba(243, 244, 246, 0.8)' }}>
                                <Box component="tr">
                                    <Box component="th" sx={{ p: { xs: 2, md: 3 }, textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>Name</Box>
                                    <Box component="th" sx={{ p: { xs: 2, md: 3 }, textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>Mana Cost</Box>
                                    <Box component="th" sx={{ p: { xs: 2, md: 3 }, textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>Type</Box>
                                    <Box component="th" sx={{ p: { xs: 2, md: 3 }, textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>Color</Box>
                                    <Box component="th" sx={{ p: { xs: 2, md: 3 }, textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>Set</Box>
                                    <Box component="th" sx={{ p: { xs: 2, md: 3 }, textAlign: 'left', fontWeight: 600, borderBottom: '1px solid #d1d5db' }}>Oracle Text</Box>
                                </Box>
                            </Box>
                            <Box component="tbody">
                                {cardsWithDupes.map((card, index) => (
                                    <Box component="tr" key={index} sx={{ background: index % 2 === 0 ? 'white' : 'rgba(249, 250, 251, 0.8)' }}>
                                        <Box component="td" sx={{ p: { xs: 2, md: 3 }, fontWeight: 500, color: '#2563eb', borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>{card.name}</Box>
                                        <Box component="td" sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>{card.mana_cost}</Box>
                                        <Box component="td" sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>{card.type_line}</Box>
                                        <Box component="td" sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>
                                            {card.colors?.map(color => colorNames[color as keyof typeof colorNames]).join(', ') || 'Colorless'}
                                        </Box>
                                        <Box component="td" sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid #d1d5db', borderRight: '1px solid #d1d5db' }}>{card.set_name}</Box>
                                        <Box component="td" sx={{ p: { xs: 2, md: 3 }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, borderBottom: '1px solid #d1d5db', maxWidth: { xs: '300px', lg: '400px' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.oracle_text}</Box>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
    
                {/* Card Statistics Summary */}
                <Box sx={{ ...styles.chartCard, marginTop: 4 }}>
                    <Typography sx={styles.chartTitle}>Card Statistics Summary</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 4, md: 6 } }}>
                        <Box sx={{ background: 'rgba(249, 250, 251, 0.8)', p: { xs: 3, md: 5 }, borderRadius: 2, border: '1px solid rgba(229, 231, 235, 0.6)', backdropFilter: 'blur(10px)' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.125rem' }, mb: { xs: 2, md: 3 }, color: '#374151' }}>General Stats</Typography>
                            <Box component="ul" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                <Box component="li" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>Total Cards:</Typography> 
                                    <Typography component="span" sx={{ color: '#1f2937' }}>{cardsWithDupes.length}</Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>Average CMC:</Typography> 
                                    <Typography component="span" sx={{ color: '#1f2937' }}>{avgCmc.toFixed(2)}</Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>Most Common Type:</Typography> 
                                    <Typography component="span" sx={{ color: '#1f2937' }}>{mostCommonType}</Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>Most Common Color:</Typography> 
                                    <Typography component="span" sx={{ color: '#1f2937' }}>{mostCommonColor}</Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Box sx={{ background: 'rgba(249, 250, 251, 0.8)', p: { xs: 3, md: 5 }, borderRadius: 2, border: '1px solid rgba(229, 231, 235, 0.6)', backdropFilter: 'blur(10px)' }}>
                            <Typography sx={{ fontWeight: 600, fontSize: { xs: '1rem', md: '1.125rem' }, mb: { xs: 2, md: 3 }, color: '#374151' }}>Artist Info</Typography>
                            <Box component="ul" sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, fontSize: { xs: '0.875rem', md: '1rem' } }}>
                                <Box component="li" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>Artist:</Typography>
                                    <Typography component="span" sx={{ color: '#1f2937' }}>{cardsWithDupes.length > 0 ? cardsWithDupes[0].artist : artist}</Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>Sets Illustrated:</Typography> 
                                    <Typography component="span" sx={{ color: '#1f2937' }}>{setData.length}</Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>Creature Types:</Typography> 
                                    <Typography component="span" sx={{ color: '#1f2937' }}>{creatureTypeData.length}</Typography>
                                </Box>
                                <Box component="li" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: { sm: 'space-between' } }}>
                                    <Typography component="span" sx={{ fontWeight: 500, color: '#4b5563' }}>Rarity Distribution:</Typography> 
                                    <Typography component="span" sx={{ color: '#1f2937', textAlign: { sm: 'right' } }}>
                                        {Object.entries(rarityDist)
                                            .map(([rarity, count]) => `${rarity.charAt(0).toUpperCase() + rarity.slice(1)}: ${count}`)
                                            .join(', ')}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ArtistCardAnalysis;
