import { Link, Typography } from "@mui/material";
import { Box } from "@mui/system"
import { calendarStyles } from "../../styles/calendar-styles";

const MarksCalendar = () => {
    document.title = 'MtG Artist Connection - Mark\'s Signing Service Calendar';
    return <Box sx={calendarStyles.container}>
        <Typography variant="h2" fontFamily={"Work Sans"} fontWeight={600}>Mark's Signing Service Calendar</Typography>
            <Typography>Mark's Signature Signing Service usually does signing in batches, with a set date that he must receive the cards to be signed. Below, you will find Mark's upcoming signing dates along with prices for regular and shadow signatures. Each artist will link to their individual page on this site so you can view all of their cards. For more direct information on how to get your cards to Mark, as well as payment information, check out the Facebook Group <Link sx={calendarStyles.artistLink} href="https://www.facebook.com/groups/545759985597960">here.</Link></Typography>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">September 1, 2023</Typography>
                <Typography variant="h5">Artist (Signature Prices - Regular / Shadow)</Typography>
                <Link sx={calendarStyles.artistLink} href="./allcards/Alan%20Rabinowitz">Alan Robinowitz ($4/$8)</Link>
                <Link sx={calendarStyles.artistLink} href="./allcards/Mark%20Winters">Mark Winters ($4 regular only)</Link>
                <Link sx={calendarStyles.artistLink} href="./allcards/Paolo%20Parente">Paolo Parente ($5/$10)</Link>
                <Link sx={calendarStyles.artistLink} href="./allcards/Richard%20Kane%20Ferguson">Richard Kane Ferguson ($5/$10)</Link>
                <Link sx={calendarStyles.artistLink} href="./allcards/Sara%20Winters">Sara Winters ($4 regular only)</Link>
            </Box>
        </Box>;
};

export default MarksCalendar;
