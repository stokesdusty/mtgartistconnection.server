import { 
    Box, 
    Button, 
    LinearProgress, 
    MenuItem, 
    Select, 
    Typography, 
    Container, 
    Paper,
    FormControl,
    InputLabel,
    FormHelperText
  } from "@mui/material";
  import { useMutation, useQuery } from "@apollo/client";
  import { useSelector } from "react-redux";
  import { useEffect, useState } from "react";
  import { GET_ARTISTS_FOR_HOMEPAGE, GET_SIGNINGEVENTS } from "../graphql/queries";
  import { ADD_ARTISTTOEVENT } from "../graphql/mutations";
  
  const AddArtistToEvent = () => {
      const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn );
  
      const {data: eventData, error: eventDataError, loading: eventDataLoading} = useQuery(GET_SIGNINGEVENTS);
      const {data: artistData, error: artistDataError, loading: artistDataLoading}= useQuery(GET_ARTISTS_FOR_HOMEPAGE);
      const [ addArtistToEvent ] = useMutation(ADD_ARTISTTOEVENT);
  
      const [filteredData, setFilteredData] = useState<any[]>([]);
      const [signingEvent, setSigningEvent] = useState<any>("Default");
      const [artist, setArtist] = useState<any>("Default");
      
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
          formControl: {
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
          loadingContainer: {
              backgroundColor: "#507A60",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
          },
          helperText: {
              color: "#666",
              fontSize: "0.875rem",
              marginTop: 1,
          },
          selectSection: {
              display: "flex",
              flexDirection: "column",
              gap: 2,
          },
      };
  
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
  
      if (eventDataLoading || artistDataLoading) {
          return (
              <Box sx={styles.container}>
                  <Box sx={styles.loadingContainer}>
                      <LinearProgress sx={{ color: "#507A60", width: "300px" }} />
                  </Box>
              </Box>
          );
      }
      
      if (eventDataError || artistDataError) {
          return (
              <Box sx={styles.container}>
                  <Container maxWidth="sm">
                      <Paper elevation={0} sx={styles.contentWrapper}>
                          <Typography sx={styles.errorMessage}>
                              Error loading data: {eventDataError?.message || artistDataError?.message}
                          </Typography>
                      </Paper>
                  </Container>
              </Box>
          );
      }
      
      if (!isLoggedIn) {
          return (
              <Box sx={styles.container}>
                  <Container maxWidth="sm">
                      <Paper elevation={0} sx={styles.contentWrapper}>
                          <Typography sx={styles.errorMessage}>
                              Error: You must be logged in to add an artist to an event
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
                          Add Artist to Event
                      </Typography>
                      
                      <Box sx={styles.form}>
                          <Typography sx={styles.sectionHeader} variant="h4">
                              Event Selection
                          </Typography>
                          
                          <Box sx={styles.fieldSection}>
                              <FormControl fullWidth sx={styles.formControl}>
                                  <InputLabel id="event-label">Signing Event</InputLabel>
                                  <Select
                                      labelId="event-label"
                                      id="event"
                                      value={signingEvent}
                                      label="Signing Event"
                                      onChange={(e) => setSigningEvent(e.target.value)}
                                  >
                                      <MenuItem value={"Default"} disabled>
                                          Select an Event
                                      </MenuItem>
                                      {filteredData.map((singleEvent) => {
                                          const startDate = new Date(singleEvent.startDate).toLocaleDateString();
                                          const endDate = new Date(singleEvent.endDate).toLocaleDateString();
                                          return (
                                              <MenuItem value={singleEvent.id} key={singleEvent.id}>
                                                  {singleEvent.name} - {singleEvent.city} ({startDate} - {endDate})
                                              </MenuItem>
                                          )
                                      })}
                                  </Select>
                                  <FormHelperText sx={styles.helperText}>
                                      Select the signing event where the artist will be present
                                  </FormHelperText>
                              </FormControl>
                          </Box>
  
                          <Typography sx={styles.sectionHeader} variant="h4">
                              Artist Selection
                          </Typography>
                          
                          <Box sx={styles.fieldSection}>
                              <FormControl fullWidth sx={styles.formControl}>
                                  <InputLabel id="artist-label">Artist</InputLabel>
                                  <Select
                                      labelId="artist-label"
                                      id="artist"
                                      value={artist}
                                      label="Artist"
                                      onChange={(e) => setArtist(e.target.value)}
                                  >
                                      <MenuItem value={"Default"} disabled>
                                          Select an Artist
                                      </MenuItem>
                                      {artistData.artists.map((singleArtist: any) => {
                                          return (
                                              <MenuItem value={singleArtist.name} key={singleArtist.name}>
                                                  {singleArtist.name}
                                              </MenuItem>
                                          )
                                      })}
                                  </Select>
                                  <FormHelperText sx={styles.helperText}>
                                      Select the artist who will be attending the event
                                  </FormHelperText>
                              </FormControl>
                          </Box>
                          
                          <Button 
                              onClick={onSubmit} 
                              variant="contained" 
                              sx={styles.submitButton}
                              fullWidth
                              disabled={signingEvent === "Default" || artist === "Default"}
                          >
                              Add Artist to Event
                          </Button>
                      </Box>
                  </Paper>
              </Container>
          </Box>
      );
  };
  
  export default AddArtistToEvent;