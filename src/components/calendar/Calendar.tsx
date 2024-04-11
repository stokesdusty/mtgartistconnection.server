import { Box } from "@mui/system"
import { calendarStyles } from "../../styles/calendar-styles";
import { Typography } from "@mui/material";

const Calendar = () => {
    document.title = 'MtG Artist Connection - Calendar';
    return <Box sx={calendarStyles.container}>
        <Typography variant="h2" fontFamily={"Work Sans"} fontWeight={600}>Signing Calendar</Typography>
        </Box>;
};

export default Calendar;