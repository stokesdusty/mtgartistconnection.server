import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from 'axios';
import { Box, Checkbox, FormControlLabel, LinearProgress, Typography } from "@mui/material";
import { allCardsStyles } from "../../styles/all-cards-styles";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import { useQuery } from "@apollo/client";

const AllCards = () => {
    const artist = useParams().name ?? "";
    document.title = `MtG Artist Connection - All ` + artist + ` Cards`;
    const [cardsWithDupes, setCardsWithDupes] = useState<any[]>([]);
    const [cardsWithoutDupes, setCardsWithoutDupes] = useState<any[]>([]);
    const [cardsLoaded, setCardsLoaded] = useState(false);
    const [totalCardsWithDupes, setTotalCardsWithDupes] = useState<string>("");
    const [totalCardsWithoutDupes, setTotalCardsWithoutDupes] = useState<string>("");
    const [showDupes, setShowDupes] = useState<boolean>(false);
    const aArtistName = artist.split(' ');
    const jSonFormattedName: any[] = [];
    const { data, error, loading } = useQuery(GET_ARTIST_BY_NAME, {
        variables: {
            name: artist
        }
    });
  
    aArtistName.forEach((aArtistName) => {
      jSonFormattedName.push(JSON.stringify(aArtistName.replace(/ /g, '')));
    }, aArtistName);
  
    let sQuery = "";
    jSonFormattedName.forEach((jSonFormattedName) => {
      sQuery = sQuery + "artist%3A" + jSonFormattedName + "+";
    })
  
    if (sQuery.endsWith("+")) {
      sQuery = sQuery.slice(0,-1);
    }
    
    const scryfallQueryWithDuplicates = `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28game%3Apaper%29+%28${sQuery}%29`;
    const scryfallQueryWithOutDuplicates = `https://api.scryfall.com/cards/search?as=grid&order=name&q=%28game%3Apaper%29+%28${sQuery}%29`;

    const handleQueryDataWithMoreData = useCallback((data: any, response: any, showDuplicates: boolean) :void => {
      if (!data) {
        if (showDuplicates) {
          setCardsWithDupes([response.data])
        } else {
          setCardsWithoutDupes([response.data])
        }
      }
      if (response.data.next_page !== undefined){
        axios.get(response.data.next_page).then((response2) => {
          let returnData
          if(data?.data) {
            returnData = data.data
          } else {
            returnData = response.data
          }
          let newData = [...returnData.data, ...response2.data.data]
          response.data.data = newData
          response.data.has_more = response2.data.has_more
          response.data.next_page = response2.data.next_page
          if (response2.data.has_more === true) {
            handleQueryDataWithMoreData(response, response2, showDuplicates);
          } else {
            if (showDuplicates){
              setCardsWithDupes([response.data]);
            } else {
              setCardsWithoutDupes([response.data])
            }
          }
        })
      }
      if (showDuplicates){
        setCardsWithDupes([response.data]);
      } else {
        setCardsWithoutDupes([response.data])
      }
    }, [])

    useEffect(() => {
      axios.get(scryfallQueryWithOutDuplicates).then((response) => {
        handleQueryDataWithMoreData([], response, false);
        setTotalCardsWithoutDupes(response.data.total_cards);
      });
      setCardsLoaded(true);
      axios.get(scryfallQueryWithDuplicates).then((response) => {
        handleQueryDataWithMoreData([], response, true);
        setTotalCardsWithDupes(response.data.total_cards);
      });
    }, [scryfallQueryWithDuplicates, scryfallQueryWithOutDuplicates, handleQueryDataWithMoreData ]);
  
    const getImage = (card: any) => { 
      if (card.image_uris) {
          return <img height={500} alt="" key={card.id} src={card.image_uris?.normal} />
      } else if (card.card_faces) {
        return <img height={500} alt="" key={card.id} src={card.card_faces[0]?.image_uris?.normal} />
      }
    }

    const handleCheck = () => {
      setShowDupes(!showDupes);
    }

    if (loading  || !cardsWithoutDupes ) return <LinearProgress />;
    if (error) return <p>Error loading artist</p>;
  
    return <Box sx={allCardsStyles.container}>
        <Box sx={allCardsStyles.bannerContainer}>
            <img src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${data.artistByName.filename}.jpeg`} alt="" />
        </Box>
            <Typography variant="h2" fontWeight={600}>All {artist} Cards ({ showDupes ? totalCardsWithDupes : totalCardsWithoutDupes})</Typography>
            {/* <Link sx={artistStyles.backLink} href="/">&#60; Back to All Artists</Link> */}
            <FormControlLabel 
              control={
                <Checkbox
                  checked={showDupes}
                  onChange={handleCheck}
                />            
              } 
              label="Show Duplicate Printings" 
            />
            <Box sx={allCardsStyles.cards}>
            {cardsLoaded === true && !showDupes && cardsWithoutDupes[0]?.data && (
            <>
                {cardsWithoutDupes[0].data.map((card: any) => (
                    getImage(card)
                ))}
            </>
            )}
            {cardsLoaded === true && showDupes && cardsWithDupes[0]?.data && (
            <>
                {cardsWithDupes[0].data.map((card: any) => (
                    getImage(card)
                ))}
            </>
            )}
        </Box>
    </Box>;
    
};

export default AllCards;