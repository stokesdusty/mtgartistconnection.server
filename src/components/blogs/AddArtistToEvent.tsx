import { Box, Button, InputLabel, LinearProgress, MenuItem, Select, TextField, Typography } from "@mui/material";
import { authStyles } from "../../styles/auth-styles";
import { homepageStyles } from "../../styles/homepage-styles";
import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { GET_ARTISTS_FOR_HOMEPAGE, GET_SIGNINGEVENTS } from "../graphql/queries";
import { ADD_ARTISTTOEVENT } from "../graphql/mutations";

const AddArtistToEvent = () => {
    const isLoggedIn = useSelector((state: any) => state.isLoggedIn );

    const {data: eventData, error: eventDataError, loading: eventDataLoading} = useQuery(GET_SIGNINGEVENTS);
    const {data: artistData, error: artistDataError, loading: artistDataLoading}= useQuery(GET_ARTISTS_FOR_HOMEPAGE);
    const [ addArtistToEvent ] = useMutation(ADD_ARTISTTOEVENT);

    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [signingEvent, setSigningEvent] = useState<any>("Default");
    const [artist, setArtist] = useState<any>("Default");
    
    useEffect(() => {
        filterEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventData]);
    const today = new Date();

    const filterEvents = () => {
        if (eventData) {
            let filtered: any[] = [];
            eventData.signingEvent.forEach((signingEvent: any) => {
                let endDate = new Date(signingEvent.endDate)
                if (endDate >= today) {
                    // eventData.endDate = endDate;
                    filtered.push(signingEvent)
                }
            })
            
            const sorted = filtered.sort((a, b) =>
                new Date(a.endDate).getTime()
                - new Date(b.endDate).getTime()
              )
            setFilteredData(sorted);
           }  else {
                setFilteredData([])
            }
    };      
    
    // console.log(artistData)
    const onSubmit = async () => {
        console.log(typeof signingEvent)
        try {
            await addArtistToEvent({
                variables: {
                    artistName: artist, 
                    eventId: signingEvent,
                },
            });
        } catch (err: any) {
            console.log(err.message);
        }
    }

    if (eventDataLoading || artistDataLoading) return (<Box sx={homepageStyles.container}><LinearProgress /></Box>);
    if (eventDataError || artistDataError) return <p>Error loading data</p>;
    if (!isLoggedIn) {
        return <p>Error</p>
    }
    return <Box sx={authStyles.container}>
        <Box sx={authStyles.formContainer}>
            <InputLabel id="event">Event</InputLabel>
            <Select
                labelId="event"
                id="event"
                placeholder="Select Event"
                value={signingEvent}
                label="Signing Event"
                onChange={(e) => setSigningEvent(e.target.value)}
            >
                <MenuItem value={"Default"}>Select an Event</MenuItem>
                {filteredData.map((singleEvent) => {
                    return (
                     <MenuItem value={singleEvent.id} key={singleEvent.id}>{singleEvent.name}</MenuItem>
                    )
                })}
            </Select>
            <InputLabel id="artist">Artist</InputLabel>
            <Select
                labelId="artist"
                id="artist"
                placeholder="Select Artist"
                value={artist}
                label="Artist"
                onChange={(e) => setArtist(e.target.value)}
            >
                <MenuItem value={"Default"}>Select an Artist</MenuItem>
                {artistData.artists.map((singleArtist: any) => {
                    return (
                     <MenuItem value={singleArtist.name} key={singleArtist.name}>{singleArtist.name}</MenuItem>
                    )
                })}
            </Select>
            <Button 
                onClick={onSubmit} 
                variant="contained" 
                sx={authStyles.submitButton}
            >
                Submit
            </Button>
        </Box>
    </Box>;
};

export default AddArtistToEvent;

