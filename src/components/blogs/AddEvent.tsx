import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Container, 
    Paper 
  } from "@mui/material";
  import { useMutation } from "@apollo/client";
  import { ADD_SIGNINGEVENT } from "../graphql/mutations";
  import { useSelector } from "react-redux";
  import { DatePicker } from "@mui/x-date-pickers";
  import { useState } from "react";
  
  const AddEvent = () => {
      const isLoggedIn = useSelector((state: any) => state.isLoggedIn );
      const [ addSigningEvent ] = useMutation(ADD_SIGNINGEVENT);
      const [ name, setName] = useState<string>("");
      const [ city, setCity] = useState<string>("");
      const [ startDateValue, setStartDateValue] = useState<any>();
      const [ endDateValue, setEndDateValue] = useState<any>();
  
      const styles = {
          container: {
              backgroundColor: "#507A60",
              minHeight: "100vh",
              padding: { xs: 2, md: 4 },
          },
          contentWrapper: {
              maxWidth: 600,
              margin: "0 auto",
              padding: { xs: 3, md: 4 },
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          },
          pageTitle: {
              color: "#507A60",
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "2.5rem" },
              marginBottom: 3,
              textAlign: "center",
          },
          sectionHeader: {
              color: "#507A60",
              fontWeight: 600,
              fontSize: "1.5rem",
              marginBottom: 2,
              marginTop: 3,
              paddingBottom: 1,
              borderBottom: "2px solid #507A60",
          },
          form: {
              display: "flex",
              flexDirection: "column",
              gap: 3,
          },
          textField: {
              "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": {
                      borderColor: "#507A60",
                  },
                  "&.Mui-focused fieldset": {
                      borderColor: "#507A60",
                  },
              },
              "& .MuiInputLabel-root": {
                  "&.Mui-focused": {
                      color: "#507A60",
                  },
              },
          },
          datePicker: {
              "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  "&:hover fieldset": {
                      borderColor: "#507A60",
                  },
                  "&.Mui-focused fieldset": {
                      borderColor: "#507A60",
                  },
              },
              "& .MuiInputLabel-root": {
                  "&.Mui-focused": {
                      color: "#507A60",
                  },
              },
          },
          submitButton: {
              backgroundColor: "#507A60",
              color: "white",
              marginTop: 3,
              padding: "12px 24px",
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: "8px",
              "&:hover": {
                  backgroundColor: "#3c5c48",
              },
          },
          fieldSection: {
              marginBottom: 2,
          },
          errorMessage: {
              color: "#d32f2f",
              textAlign: "center",
              padding: 4,
              backgroundColor: "rgba(211, 47, 47, 0.1)",
              borderRadius: 2,
              marginBottom: 2,
          },
          dateSection: {
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2,
              marginBottom: 2,
          },
          dateField: {
              flex: 1,
          },
      };
  
      const onSubmit = async () => {
          try {
              console.log(name, city, startDateValue, endDateValue);
              console.log('test');
              const start = startDateValue?.toString();
              const end = endDateValue?.toString();
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
      };
  
      if (!isLoggedIn) {
          return (
              <Box sx={styles.container}>
                  <Container maxWidth="sm">
                      <Paper elevation={0} sx={styles.contentWrapper}>
                          <Typography sx={styles.errorMessage}>
                              Error: You must be logged in to add a signing event
                          </Typography>
                      </Paper>
                  </Container>
              </Box>
          );
      }
  
      return (
          <Box sx={styles.container}>
              <Container maxWidth="sm">
                  <Paper elevation={0} sx={styles.contentWrapper}>
                      <Typography variant="h2" sx={styles.pageTitle}>
                          Add Signing Event
                      </Typography>
                      
                      <Box sx={styles.form}>
                          <Typography sx={styles.sectionHeader} variant="h4">
                              Event Information
                          </Typography>
                          
                          <Box sx={styles.fieldSection}>
                              <TextField 
                                  fullWidth
                                  label="Event Name"
                                  value={name}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                      setName(event.target.value);
                                  }}
                                  sx={styles.textField}
                                  placeholder="Enter the name of the signing event"
                              />
                          </Box>
                          
                          <Box sx={styles.fieldSection}>
                              <TextField 
                                  fullWidth
                                  label="City"
                                  value={city}
                                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                      setCity(event.target.value);
                                  }}
                                  sx={styles.textField}
                                  placeholder="Enter the city where the event takes place"
                              />
                          </Box>
  
                          <Typography sx={styles.sectionHeader} variant="h4">
                              Event Dates
                          </Typography>
                          
                          <Box sx={styles.dateSection}>
                              <Box sx={styles.dateField}>
                                  <DatePicker 
                                      label="Start Date"
                                      onChange={(value) => setStartDateValue(value)}
                                      sx={styles.datePicker}
                                      slotProps={{
                                          textField: {
                                              fullWidth: true,
                                          },
                                      }}
                                  />
                              </Box>
                              
                              <Box sx={styles.dateField}>
                                  <DatePicker 
                                      label="End Date"
                                      onChange={(value) => setEndDateValue(value)}
                                      sx={styles.datePicker}
                                      slotProps={{
                                          textField: {
                                              fullWidth: true,
                                          },
                                      }}
                                  />
                              </Box>
                          </Box>
                          
                          <Button 
                              onClick={onSubmit} 
                              variant="contained" 
                              sx={styles.submitButton}
                              fullWidth
                              disabled={!name || !city || !startDateValue || !endDateValue}
                          >
                              Add Signing Event
                          </Button>
                      </Box>
                  </Paper>
              </Container>
          </Box>
      );
  };
  
  export default AddEvent;