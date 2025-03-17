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
        if (!formattedArtistName) return "";
        const baseQuery = "artist%3A";
        const formattedQuery = `${baseQuery}"${formattedArtistName}"`;
        return `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28game%3Apaper%29+%28${formattedQuery}%29`;
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
            if (!scryfallQuery) return;
            const withDupesData = await fetchCards(
                scryfallQuery
            );
            if (withDupesData) {
                setCardsWithDupes(withDupesData);
            }
        };
        fetchData();
    }, [scryfallQuery, fetchCards]);

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
    const avgCmc = cardsWithDupes.reduce((sum, card) => sum + card.cmc, 0) / cardsWithDupes.length;
    const mostCommonType = typeData.sort((a, b) => (b.count as number) - (a.count as number))[0]?.type || 'N/A';
    const mostCommonColor = colorData.sort((a, b) => (b.count as number) - (a.count as number))[0]?.fullName || 'N/A';

    const styles = {
        container: {
            maxWidth: 1200,
            margin: "0 auto",
            padding: { xs: 2, md: 4 },
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        },
        loadingContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            "& .MuiCircularProgress-root": {
              color: "#507A60",
            },
          },
          errorMessage: {
            color: "#d32f2f",
            textAlign: "center",
            padding: 4,
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            borderRadius: 2,
          },
    };

    if (isFetching) {
        return (
            <Box sx={styles.loadingContainer}>
              <CircularProgress sx={{ color: "#507A60" }} />
            </Box>
          );
    }
    if(error) {
        return (
            <Box sx={styles.container}>
              <Typography sx={styles.errorMessage}>
                Error loading cards: {error}
              </Typography>
            </Box>
          );
    }
    if (!cardsWithDupes || cardsWithDupes.length === 0) {
        return (
            <Box sx={styles.container}>
              <Typography sx={styles.errorMessage}>
                No cards found for {artist}
              </Typography>
            </Box>
          );
    }
    return (
        <Box sx={styles.container}>
            <div className="flex flex-col p-2 sm:p-4 md:p-6 bg-gray-50 rounded-lg w-full">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 md:mb-6 text-center text-gray-800">MTG Card Analysis Dashboard</h1>
                <h2 className="text-lg sm:text-xl font-semibold mb-4 md:mb-6 text-center text-gray-600">Artist: {cardsWithDupes[0].artist}</h2>
    
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Mana Cost Distribution */}
                    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-gray-200 transition-transform hover:translate-y-[-5px]">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-700" style={{ borderBottom: '2px solid #8884d8', paddingBottom: '8px', display: 'inline-block' }}>Mana Cost Distribution</h2>
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
                    </div>
    
                    {/* Card Type Distribution */}
                    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-gray-200 transition-transform hover:translate-y-[-5px]">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-700" style={{ borderBottom: '2px solid #00C49F', paddingBottom: '8px', display: 'inline-block' }}>Card Type Distribution</h2>
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
                    </div>
    
                    {/* Color Distribution */}
                    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-gray-200 transition-transform hover:translate-y-[-5px]">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-700" style={{ borderBottom: '2px solid #FF8042', paddingBottom: '8px', display: 'inline-block' }}>Color Distribution</h2>
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
                    </div>
    
                    {/* Set Distribution */}
                    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md border border-gray-200 transition-transform hover:translate-y-[-5px]">
                        <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-700" style={{ borderBottom: '2px solid #FFBB28', paddingBottom: '8px', display: 'inline-block' }}>Set Distribution (Top 10)</h2>
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
                    </div>
                </div>
    
                {/* Card List */}
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200 mt-4 md:mt-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-700">Card Details</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white text-xs sm:text-sm md:text-base" style={{ borderCollapse: 'collapse', border: '1px solid #e5e7eb' }}>
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 md:p-3 text-left font-semibold border-b border-r border-gray-300">Name</th>
                                    <th className="p-2 md:p-3 text-left font-semibold border-b border-r border-gray-300">Mana Cost</th>
                                    <th className="p-2 md:p-3 text-left font-semibold border-b border-r border-gray-300">Type</th>
                                    <th className="p-2 md:p-3 text-left font-semibold border-b border-r border-gray-300">Color</th>
                                    <th className="p-2 md:p-3 text-left font-semibold border-b border-r border-gray-300">Set</th>
                                    <th className="p-2 md:p-3 text-left font-semibold border-b border-gray-300">Oracle Text</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cardsWithDupes.map((card, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="p-2 md:p-3 font-medium text-blue-600 border-b border-r border-gray-300">{card.name}</td>
                                        <td className="p-2 md:p-3 border-b border-r border-gray-300">{card.mana_cost}</td>
                                        <td className="p-2 md:p-3 border-b border-r border-gray-300">{card.type_line}</td>
                                        <td className="p-2 md:p-3 border-b border-r border-gray-300">
                                            {card.colors?.map(color => colorNames[color as keyof typeof colorNames]).join(', ') || 'Colorless'}
                                        </td>
                                        <td className="p-2 md:p-3 border-b border-r border-gray-300">{card.set_name}</td>
                                        <td className="p-2 md:p-3 text-xs sm:text-sm border-b border-gray-300 max-w-xs lg:max-w-md truncate">{card.oracle_text}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
    
                {/* Card Statistics Summary */}
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200 mt-4 md:mt-6">
                    <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-4 text-gray-700">Card Statistics Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="bg-gray-50 p-3 md:p-5 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-gray-700">General Stats</h3>
                            <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                                <li className="flex justify-between">
                                    <span className="font-medium text-gray-600">Total Cards:</span> 
                                    <span className="text-gray-800">{cardsWithDupes.length}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-medium text-gray-600">Average CMC:</span> 
                                    <span className="text-gray-800">{avgCmc.toFixed(2)}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-medium text-gray-600">Most Common Type:</span> 
                                    <span className="text-gray-800">{mostCommonType}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-medium text-gray-600">Most Common Color:</span> 
                                    <span className="text-gray-800">{mostCommonColor}</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-3 md:p-5 rounded-lg border border-gray-200">
                            <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 text-gray-700">Artist Info</h3>
                            <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                                <li className="flex justify-between">
                                    <span className="font-medium text-gray-600">Artist:</span> 
                                    <span className="text-gray-800">{cardsWithDupes[0].artist}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-medium text-gray-600">Sets Illustrated:</span> 
                                    <span className="text-gray-800">{setData.length}</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-medium text-gray-600">Creature Types:</span> 
                                    <span className="text-gray-800">{creatureTypeData.length}</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:justify-between">
                                    <span className="font-medium text-gray-600">Rarity Distribution:</span> 
                                    <span className="text-gray-800 text-right">
                                        {Object.entries(rarityDist)
                                            .map(([rarity, count]) => `${rarity.charAt(0).toUpperCase() + rarity.slice(1)}: ${count}`)
                                            .join(', ')}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Box>
    );
};

export default ArtistCardAnalysis;
