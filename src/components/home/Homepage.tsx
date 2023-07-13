import { Box, LinearProgress, TextField } from "@mui/material"
import { homepageStyles } from "../../styles/homepage-styles"
import { useQuery } from "@apollo/client"
import { GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries"
import ArtistGridItem from "./ArtistGridItem"
import { useEffect, useState } from "react"

const Homepage = () => {
    const {data, error, loading}= useQuery(GET_ARTISTS_FOR_HOMEPAGE);
    const [userSearch, setUserSearch] = useState("");
    const [filteredData, setFilteredData] = useState<any[]>([]);

    useEffect(() => {
        filterArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSearch, data]);

    const filterArtists = () => {
        if (userSearch.length >= 2) {
            let filtered: any[] = [];
            // console.log(typeof data.artists);
            const userSearchConverted = userSearch.replace(' ', '');
            data.artists.forEach((artist: any) => {
                // console.log(artist);
                if (artist.filename.includes(userSearchConverted.toLowerCase())) {
                    filtered.push(artist);
                }
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(data?.artists)
        }
    };

    if (loading) return <LinearProgress />;
    if (error) return <p>Error loading artists</p>;
    return data && (
        <Box sx={homepageStyles.container}>
            <Box sx={homepageStyles.wrapper}>
            <TextField 
                sx={homepageStyles.textField} 
                value={userSearch}
                placeholder="Search for artist"
                onChange={(e) => setUserSearch(e.target.value)}
                InputProps={
                    {style: {
                        width: "80%", 
                        borderRadius: "20px",
                        fontFamily: "Work Sans",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }, 
                    }
                } 
            />
                {filteredData && filteredData.length && 
                filteredData.map((artist: any) => {
                    return <ArtistGridItem artistData={artist} />
                })}
            </Box>
            
        </Box>
    )
}

export default Homepage;