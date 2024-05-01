import { Box } from "@mui/system"
import { calendarStyles } from "../../styles/calendar-styles";
import { LinearProgress, Typography } from "@mui/material";
import { GET_SIGNINGEVENTS } from "../graphql/queries";
import { useQuery } from "@apollo/client";
import { homepageStyles } from "../../styles/homepage-styles";
import SigningEvent from "./SigningEvent";
import { useEffect, useState } from "react";

const Calendar = () => {
    document.title = 'MtG Artist Connection - Calendar';

    const {data, error, loading}= useQuery(GET_SIGNINGEVENTS);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    
    useEffect(() => {
        filterEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);
    const today = new Date();

    const filterEvents = () => {
        if (data) {
            let filtered: any[] = [];
            data.signingEvent.forEach((eventData: any) => {
                let endDate = new Date(eventData.endDate)
                if (endDate >= today) {
                    // eventData.endDate = endDate;
                    filtered.push(eventData)
                }
            })
            
            const sorted = filtered.sort((a, b) =>
                new Date(a.endDate).getTime()
                - new Date(b.endDate).getTime()
              )
            console.log(sorted)
            console.log(filtered)
            setFilteredData(sorted);
           }  else {
                setFilteredData([])
            }
    };      

    if (loading) return (<Box sx={homepageStyles.container}><LinearProgress /></Box>);
    if (error) return <p>Error loading calendar</p>;
    return <Box sx={calendarStyles.container}>
        <Typography variant="h2" fontFamily={"Work Sans"} fontWeight={600}>Signing Calendar</Typography>
        <Box>
           {!loading && filteredData && filteredData.map((eventData: any) => {
            const endDate = new Date(eventData.endDate);
            const today = new Date();
            if (endDate > today) {
                return (
                    <SigningEvent props={eventData} key={eventData.name} />)
            }
           })}
        </Box>
        
    </Box>;
};

export default Calendar;