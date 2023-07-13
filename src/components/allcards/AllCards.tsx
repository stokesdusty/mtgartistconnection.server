import { useEffect, useState } from "react";
import { useParams } from "react-router";
import axios from 'axios';
import { Box, LinearProgress, Typography } from "@mui/material";
import { allCardsStyles } from "../../styles/all-cards-styles";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import { useQuery } from "@apollo/client";

const AllCards = () => {
    const artist = useParams().name ?? "";
    const [cards, setCards] = useState<any[]>([]);
    const [cardsLoaded, setCardsLoaded] = useState(false);
    const [totalCards, setTotalCards] = useState<any[] | string>("");
    const aArtistName = artist.split(' ');
    const jSonFormattedName: any[] = [];
    console.log(artist);
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
    
    const scryfallQuery = `https://api.scryfall.com/cards/search?as=grid&order=name&q=%28game%3Apaper%29+%28${sQuery}%29`;
  
    useEffect(() => {
      axios.get(scryfallQuery).then((response) => {
        let returnedData = [response.data];
        if (response.data.has_more === true) {
          axios.get(response.data.next_page).then((response2) => {
              returnedData = returnedData[0].data.concat(response2.data.data);
              const allCardData = Object.assign(returnedData);
              setCards(
                  [{
                      data: allCardData
                  }]);
              setCardsLoaded(true);
          });
        }
        setCards(returnedData);
        setTotalCards(returnedData[0].total_cards);
        setCardsLoaded(true);
      });
    }, [scryfallQuery]);
  
    const getImage = (card: any) => { 
      if (card.image_uris) {
          return <img height={500} alt="" key={card.cardmarket_id} src={card.image_uris.normal} />
      }
    }

    if (loading  || !cards ) return <LinearProgress />;
    if (error) return <p>Error loading artist</p>;
  
    return <Box sx={allCardsStyles.container}>
        <Box sx={allCardsStyles.bannerContainer}>
            <img src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${data.artistByName.filename}.jpeg`} alt="" />
        </Box>
            <Typography variant="h2" fontWeight={600}>All {artist} Cards ({totalCards})</Typography>
            {/* <Link sx={artistStyles.backLink} href="/">&#60; Back to All Artists</Link> */}
            <Box sx={allCardsStyles.cards}>
            {cardsLoaded === true && (
            <>
                {cards[0].data.map((card: any) => (
                    getImage(card)
                ))}
            </>
            )}
        </Box>
    </Box>;
    
};

export default AllCards;