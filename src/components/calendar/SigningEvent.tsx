import { Box } from "@mui/system";
import { calendarStyles } from "../../styles/calendar-styles";
import { LinearProgress, Typography, Link, useTheme, useMediaQuery } from "@mui/material";
import { GET_ARTISTSBYEVENTID } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { homepageStyles } from "../../styles/homepage-styles";

const SigningEvent = (SigningEventProps: any) => {
    const startDateFormatted = new Date(SigningEventProps.props.startDate).toLocaleDateString();
    const endDateFormatted = new Date(SigningEventProps.props.endDate).toLocaleDateString();
    const eventId = SigningEventProps.props.id;
    const theme = useTheme();
    const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));
    const {data: artistData, error, loading} = useQuery(GET_ARTISTSBYEVENTID, {
        variables: {
            eventId
        }
    });
    
    if (loading) return (<Box sx={homepageStyles.container}><LinearProgress /></Box>);
    if (error) return <p>Error loading calendar</p>;
    return (
        <Box sx={calendarStyles.signingEventsContainer} key={SigningEventProps.props.name}>
            <Box>
                <Typography variant={isBelowMedium ? "h3" : "h2"} >{SigningEventProps.props.name}</Typography>
            </Box>
            <Box sx={calendarStyles.groupingContainer}>
                <Typography variant="h5" >{startDateFormatted} - {endDateFormatted}</Typography>
                <Typography variant="h5" >{SigningEventProps.props.city}</Typography>
            </Box>
            <Box sx={calendarStyles.linksContainer}>
                {artistData.mapArtistToEventByEventId && artistData.mapArtistToEventByEventId.map((artist: any) => {
                    const artistLink = "/artist/" + artist.artistName;
                    return (
                        <Link key={artist.artistName} sx={calendarStyles.link} href={artistLink} >{artist.artistName}</Link>
                    )
                } )}
            </Box>
        </Box>
    );
};

export default SigningEvent;
