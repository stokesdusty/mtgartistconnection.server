import {
  useCallback,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Typography,
} from "@mui/material";
import { allCardsStyles } from "../../styles/all-cards-styles";
import { GET_ARTIST_BY_NAME } from "../graphql/queries";
import { useQuery } from "@apollo/client";

interface Card {
  id: string;
  image_uris?: {
    border_crop: string;
  };
  card_faces?: {
    image_uris?: {
      normal: string;
    };
  }[];
}

interface ScryfallResponse {
  data: Card[];
  has_more: boolean;
  next_page?: string;
  total_cards: number;
}

interface CardData {
  data: Card[];
  total_cards: number;
}

interface CardsAndTotal {
  cards: Card[];
  totalCards: number;
}

const AllCards = () => {
  const { name: artist } = useParams<{ name?: string }>();
  const navigate = useNavigate();
  const [showDupes, setShowDupes] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState(false);
  const [cardsWithDupes, setCardsWithDupes] = useState<CardData>({
    data: [],
    total_cards: 0,
  });
  const [cardsWithoutDupes, setCardsWithoutDupes] = useState<CardData>({
    data: [],
    total_cards: 0,
  });

  //Handle if no artist was provided.
  useEffect(() => {
    if (!artist) {
      navigate("/");
    }
  }, [artist, navigate]);

  document.title = `MtG Artist Connection - All ${artist} Cards`;

  const { data: artistData, error, loading } = useQuery(GET_ARTIST_BY_NAME, {
    variables: {
      name: artist || "",
    },
    skip: !artist,
  });

  const formattedArtistName = useMemo(() => {
    return artist?.split(" ").join(" ") || "";
  }, [artist]);

  const scryfallQuery = useMemo(() => {
    if (!artist) return null;
    const baseQuery = "artist%3A";
    const formattedQuery = `${baseQuery}"${formattedArtistName}"`;
    return {
      withDuplicates: `https://api.scryfall.com/cards/search?as=grid&unique=prints&order=name&q=%28game%3Apaper%29+%28${formattedQuery}%29`,
      withoutDuplicates: `https://api.scryfall.com/cards/search?as=grid&order=name&q=%28game%3Apaper%29+%28${formattedQuery}%29`,
    };
  }, [formattedArtistName, artist]);

  const fetchCards = useCallback(
    async (
      url: string,
      showDuplicates: boolean,
      previousData: Card[] = []
    ): Promise<Card[] | null> => {
      setIsFetching(true);
      try {
        const response = await axios.get<ScryfallResponse>(url);
        let allData: Card[] = [...previousData, ...response.data.data];

        if (response.data.has_more && response.data.next_page) {
          const nextPageData = await fetchCards(
            response.data.next_page,
            showDuplicates,
            allData
          );
          if(nextPageData) allData = nextPageData;
        }

        return allData;
      } catch (error) {
        console.error("Error fetching cards:", error);
        return null;
      } finally {
        setIsFetching(false);
      }
    },
    []
  );

  const { cards, totalCards } = useMemo<CardsAndTotal>(() => {
    if (!scryfallQuery) {
      return { cards: [], totalCards: 0 };
    }
    const selectedData = showDupes ? cardsWithDupes : cardsWithoutDupes;
    return { cards: selectedData.data, totalCards: selectedData.total_cards };
  }, [showDupes, scryfallQuery, cardsWithDupes, cardsWithoutDupes]);

  useEffect(() => {
    const fetchData = async () => {
      if (!scryfallQuery) return;
      const noDupesData = await fetchCards(
        scryfallQuery.withoutDuplicates,
        false
      );
      if (noDupesData) {
        setCardsWithoutDupes({data: noDupesData, total_cards: noDupesData.length});
      }
      const withDupesData = await fetchCards(
        scryfallQuery.withDuplicates,
        true
      );
      if (withDupesData) {
        setCardsWithDupes({data: withDupesData, total_cards: withDupesData.length});
      }
    };
    fetchData();
  }, [scryfallQuery, fetchCards]);

  const getImage = (card: Card) => {
    if (card.image_uris) {
      return (
        <img
          height={500}
          alt=""
          key={card.id}
          src={card.image_uris.border_crop}
        />
      );
    } else if (card.card_faces) {
      return (
        <img
          height={500}
          alt=""
          key={card.id}
          src={card.card_faces[0]?.image_uris?.normal}
        />
      );
    }
    return null;
  };

  const handleCheck = () => {
    setShowDupes(!showDupes);
  };

  if (!artist) return null; // Render nothing if there is no artist
  if (loading || isFetching || !cardsWithoutDupes)
    return <LinearProgress />;
  if (error) return <p>Error loading artist</p>;
  if (!artistData?.artistByName) return <p>Error artist not found</p>;

  return (
    <Box sx={allCardsStyles.container}>
      <Box sx={allCardsStyles.bannerContainer}>
        <img
          src={`https://mtgartistconnection.s3.us-west-1.amazonaws.com/banner/${artistData.artistByName.filename}.jpeg`}
          alt=""
        />
      </Box>
      <Typography variant="h2" fontWeight={600}>
        All {artist} Cards ({totalCards})
      </Typography>
      <FormControlLabel
        control={<Checkbox checked={showDupes} onChange={handleCheck} />}
        label="Show All Printings"
      />
      <Box sx={allCardsStyles.cards}>
        {cards.map((card) => getImage(card))}
      </Box>
    </Box>
  );
};

export default AllCards;
