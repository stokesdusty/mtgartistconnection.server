import { Box, Button, InputLabel, TextField, Typography } from "@mui/material";
import { authStyles } from "../../styles/auth-styles";
import { useMutation } from "@apollo/client";
import { ADD_SIGNINGEVENT } from "../graphql/mutations";
import { useSelector } from "react-redux";
import { DatePicker } from "@mui/x-date-pickers";
import { useState } from "react";

const AddEvent = () => {
    const isLoggedIn = useSelector((state: any) => state.isLoggedIn );
    const [ addSigningEvent ] = useMutation(ADD_SIGNINGEVENT);
    const [ name, setName] = useState<any>();
    const [ city, setCity] = useState<any>();
    const [ startDateValue, setStartDateValue] = useState<any>();
    const [ endDateValue, setEndDateValue] = useState<any>();

   
    const onSubmit = async () => {
        try {
            console.log(name, city, startDateValue, endDateValue)
            console.log('test')
            const start = startDateValue.toString();
            const end = endDateValue.toString();
            await addSigningEvent({
                variables: {
                    name, 
                    city,
                    startDate: start,
                    endDate: end,
                },
            });
        } catch (err: any) {
            console.log(err.message);
        }
    }

    if (!isLoggedIn) {
        return <p>Error</p>
    }
    return <Box sx={authStyles.container}>
        <Box sx={authStyles.formContainer}>
            <Typography sx={authStyles.logoText}>
              Add Signing Event
            </Typography>{" "}
            {/* @ts-ignore */}
            <InputLabel aria-label="name"></InputLabel>
            <TextField 
                margin="normal" 
                InputProps={{style: {borderRadius: 20}}}
                aria-label="name" 
                label="Name" 
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setName(event.target.value);}}
            />           
            <InputLabel aria-label="city"></InputLabel>
            <TextField 
                sx={{paddingBottom: "20px"}}
                margin="normal" 
                InputProps={{style: {borderRadius: 20}}}
                aria-label="city" 
                label="City" 
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setCity(event.target.value);}}
                />
            <DatePicker 
                sx={{paddingBottom: "20px"}}
                aria-label="startDate"
                label="Start Date"
                onChange={(value) => setStartDateValue(value?.toString())}
            />
            <DatePicker 
                sx={{paddingBottom: "20px"}}
                aria-label="startDate"
                label="End Date"
                onChange={(value) => setEndDateValue(value?.toString())}
            />
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

export default AddEvent;

