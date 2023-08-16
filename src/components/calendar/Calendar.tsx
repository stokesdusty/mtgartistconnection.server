import { Box } from "@mui/system"
import { calendarStyles } from "../../styles/calendar-styles";
import { Link, Typography } from "@mui/material";

const Calendar = () => {
    document.title = 'MtG Artist Connection - Calendar';
    return <Box sx={calendarStyles.container}>
        <Typography variant="h2" fontFamily={"Work Sans"} fontWeight={600}>Signing Calendar</Typography>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">August 25 - 27:   Flesh and Blood Las Vegas - Las Vegas, NV</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Poole">Mark Poole</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Steve%20Argyle">Steve Argyle</Link>
            </Box>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">August 31 - September 4:   Dragon Con - Atlanta, GA</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Alex%20Dos%20Diaz">Alex Dos Diaz</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Bruce%20Brenneise">Bruce Brenneise</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Greg%20Hildebrandt">Greg Hildebrandt</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Sarah%20Finnigan">Sarah Finnigan</Link>
            </Box>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">Sept 2-4:   SCG Con Columbus - Columbus, OH</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Andrea%20Radeck">Andrea Radeck</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Christopher%20Moeller">Christopher Moeller</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Poole">Mark Poole</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Tedin">Mark Tedin</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Phil%20Stone">Phil Stone</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Randy%20Gallegos">Randy Gallegos</Link>
            </Box>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">Sept 22-24:   Magic Con Las Vegas - Las Vegas, NV</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Alayna%20Danner">Alayna Danner</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/John%20Avon">John Avon</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Ken%20Meyer%20Jr">Ken Meyer Jr</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Kieran%20Yanner">Kieran Yanner</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Poole">Mark Poole</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Tedin">Mark Tedin</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/rk%20Post">rk Post</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Tyler%20Jacobson">Tyler Jacobson</Link>
            </Box>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">October 7-8:   LotusCon St. Louis 2023 - St. Louis, MS</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Dan%20Scott">Dan Scott</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Jeff%20Laubenstein">Jeff Laubenstein</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Ken%20Meyer%20Jr">Ken Meyer Jr</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Zug">Mark Zug</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Phil%20Stone">Phil Stone</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/RK%20Post">rk Post</Link>
            </Box>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">Oct 18-22:   Illuxcon - Reading, PA</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Alan%20Pollack">Alan Pollack</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/David%20Palumbo">David Palumbo</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Donato%20Giancola">Donato Giancola</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Drew%20Tucker">Drew Tucker</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Jeff%20Miracola">Jeff Miracola</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Poole">Mark Poole</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Zug">Mark Zug</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Matt%20Stewart">Matt Stewart</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Michael%20C%20Hayes">Michael Hays</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Omar%20Rayyan">Omar Rayyan</Link>
                <Link sx={calendarStyles.artistLink} href="./artist/Rob%20Alexander">Rob Alexander</Link>
                Sam Guay
                <Link sx={calendarStyles.artistLink} href="./artist/Sarah%20Finnigan">Sarah Finnigan</Link>
            </Box>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">Oct 26-29:   MTG Summit - Salt Lake City, UT</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Poole">Mark Poole</Link>
            </Box>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">October 20-22:   SCGCon Dallas/Fort Worth 2023 - Dallas, TX</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Dan%20Scott">Dan Scott</Link>
            </Box>
            <Box sx={calendarStyles.eventContainer}>
                <Typography variant="h4">Nov 10-12:   SCG Con Pittsburgh - Pittsburgh, PA</Typography>
                <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Poole">Mark Poole</Link>
            </Box>
        </Box>;
};

export default Calendar;