import { Box } from "@mui/system"
import { calendarStyles } from "../../styles/calendar-styles";
import { Link, Typography } from "@mui/material";

const Calendar = () => {
    return <Box sx={calendarStyles.container}>
        <Typography variant="h2" fontFamily={"Work Sans"} fontWeight={600}>Signing Calendar</Typography>
        <Box sx={calendarStyles.eventContainer}>
            <Typography variant="h4">July 14-16:   SCGCon Cincinnati - Cincinnati, OH</Typography>
            <Link sx={calendarStyles.artistLink} href="./artist/Dan%20Scott">Dan Scott</Link>
        </Box>
        <Box sx={calendarStyles.eventContainer}>
            <Typography variant="h4">July 22-23:   QuadCon Peoria - Peoria, IL</Typography>
            <Link sx={calendarStyles.artistLink} href="./artist/RK%20Post">rk Post</Link>
        </Box>
        <Box sx={calendarStyles.eventContainer}>
            <Typography variant="h4">July 28-30:   Magic Con Barcelona 2023 - Barcelona, Spain</Typography>
            <Link sx={calendarStyles.artistLink} href="./artist/Alexis%20Hernandez">Alexis Hernandez</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/John%20Avon">John Avon</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Justin%20Hernandez">Justin Hernandez</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Richard%20Kane%20Ferguson">Richard Kane Ferguson</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Wizard%20Of%20Barge">Wizard of Barge</Link>
          </Box>
          <Box sx={calendarStyles.eventContainer}>
            <Typography variant="h4">August 3-6:   GenCon 2023 - Indianapolis, IN</Typography>
            <Link sx={calendarStyles.artistLink} href="./artist/Bruce%20Brenneise">Bruce Brenneise</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Dan%20Scott">Dan Scott</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Jeff%20A%20Menges">Jeff A Menges</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Mark%20Poole">Mark Poole</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Omar%20Rayyan">Omar Rayyan</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/RK%20Post">rk Post</Link>
          </Box>
          <Box sx={calendarStyles.eventContainer}>
            <Typography variant="h4">August 31-September 4:   Dragon Con - Atlanta, GA</Typography>
            <Link sx={calendarStyles.artistLink} href="./artist/Alex%20Dos%20Diaz">Alex Dos Diaz</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Bruce%20Brenneise">Bruce Brenneise</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Greg%20Hildebrandt">Greg Hildebrandt</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Sarah%20Finnigan">Sarah Finnigan</Link>
        </Box>
        <Box sx={calendarStyles.eventContainer}>
            <Typography variant="h4">October 7-8:   LotusCon St. Louis 2023 - St. Louis, MS</Typography>
            <Link sx={calendarStyles.artistLink} href="./artist/Dan%20Scott">Dan Scott</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Jeff%20Laubenstein">Jeff Laubenstein</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Ken%20Meyer%20Jr">Ken Meyer Jr</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/Phil%20Stone">Phil Stone</Link>
            <Link sx={calendarStyles.artistLink} href="./artist/RK%20Post">rk Post</Link>
        </Box>
        <Box sx={calendarStyles.eventContainer}>
            <Typography variant="h4">October 20-22:   SCGCon Dallas/Fort Worth 2023 - Dallas, TX</Typography>
            <Link sx={calendarStyles.artistLink} href="./artist/Dan%20Scott">Dan Scott</Link>
        </Box>
    </Box>;
};

export default Calendar;