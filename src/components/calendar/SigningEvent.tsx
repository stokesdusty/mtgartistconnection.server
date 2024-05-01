import { Box } from "@mui/system";
import { calendarStyles } from "../../styles/calendar-styles";
import { Typography } from "@mui/material";

const SigningEvent = (SigningEventProps: any) => {
    const startDateFormatted = new Date(SigningEventProps.props.startDate).toLocaleDateString();
    const endDateFormatted = new Date(SigningEventProps.props.endDate).toLocaleDateString();

    return (
        <Box sx={calendarStyles.signingEventsContainer} key={SigningEventProps.props.name}>
            <Box sx={calendarStyles.groupingContainer}>
                <Typography >{startDateFormatted} - {endDateFormatted}</Typography>
                <Typography variant="h2" >{SigningEventProps.props.name}</Typography>
                <Typography >{SigningEventProps.props.city}</Typography>
            </Box>
        </Box>
    );
};

export default SigningEvent;
