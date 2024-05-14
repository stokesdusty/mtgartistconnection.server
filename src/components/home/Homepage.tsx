import { Box, LinearProgress, TextField, Typography } from "@mui/material"
import { homepageStyles } from "../../styles/homepage-styles"
import { useQuery } from "@apollo/client"
import { GET_ARTISTS_FOR_HOMEPAGE } from "../graphql/queries"
import ArtistGridItem from "./ArtistGridItem"
import { useEffect, useState } from "react"

const Homepage = () => {
    document.title = 'MtG Artist Connection';
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
            const userSearchConverted = userSearch.replace(' ', '');
            data.artists.forEach((artist: any) => {
                if (artist.filename.includes(userSearchConverted.toLowerCase())) {
                    filtered.push(artist);
                }
            });
            setFilteredData(filtered);
        } else {
            setFilteredData(data?.artists)
        }
    };

    if (loading) return (<Box sx={homepageStyles.container}><LinearProgress /></Box>);
    if (error) return <p>Error loading artists</p>;
    return data && (
        <Box sx={homepageStyles.container}>
            <Box sx={homepageStyles.wrapper}>
                <Typography variant="h1" sx={homepageStyles.headerText}>Welcome to MTG Artist Connection</Typography>
                <Typography>We all love and appreciate the art in our favorite card game. Finding the artists to get cards signed, view their other work, and following their socials shouldn't be as tough as it is. So we created MTG Artist Connection, a place where we aspire to collect as much useful data to help fans connect with the art in a whole new way.</Typography>
                <Typography sx={homepageStyles.count}>{data.artists.length} artists and counting!</Typography><br />
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
                            backgroundColor: "#fff"
                        }, 
                        }
                    } 
                />
                    {filteredData && filteredData.length > 0 && 
                    filteredData.map((artist: any) => {
                        return <ArtistGridItem artistData={artist} key={artist.name} />
                    })}
            </Box>
        </Box>
    )
}

export default Homepage;