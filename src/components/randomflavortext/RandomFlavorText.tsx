import { Box } from "@mui/system"
import { calendarStyles } from "../../styles/calendar-styles";
import { Button, LinearProgress, Typography, useTheme, useMediaQuery } from "@mui/material";
import { homepageStyles } from "../../styles/homepage-styles";
import { useEffect, useState } from "react";
import axios from "axios";
import { randomFlavorStyles } from "../../styles/random-flavor-styles";

const RandomFlavorText = () => {
    document.title = 'MtG Artist Connection - Random Flavor Text';
    const [cardData, setCardData] = useState<any>();
    const [update, setUpdate] = useState(false);
    const theme = useTheme();
    const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));

    const scryfallQuery = 'https://api.scryfall.com/cards/random?q=has%3Aflavor';
    useEffect(() => {
        axios.get(scryfallQuery).then((response) => {
            setCardData(response.data);
        })
    }, [update])

    const handleReload = () => {
        setUpdate(!update);
    }

    if (!cardData) return (<Box sx={homepageStyles.container}><LinearProgress /></Box>);
    return <Box sx={calendarStyles.container}>
        <Typography variant="h4" fontFamily={"Work Sans"} fontWeight={600}>Random Flavor of MtG</Typography>
        <Box sx={randomFlavorStyles.innerContainer}>
           {cardData && (
            <Box sx={isBelowMedium ? randomFlavorStyles.containerMobile : randomFlavorStyles.container}>
                <Typography variant="h5" fontFamily={"Work Sans"}>{cardData.name}</Typography>
                <Box sx={randomFlavorStyles.imageContainer}>
                    <img height={isBelowMedium ? 250 : 500} alt="" key={cardData?.id} src={cardData?.image_uris?.art_crop} />
                </Box>
                <Typography variant={isBelowMedium ? "h6" : "h5"} fontFamily={"Work Sans"}>{cardData.flavor_text}</Typography>
            </Box>
           )}
           <Button
            sx={randomFlavorStyles.button}
            variant={"contained"}
            color={"success"}
            onClick={() => {
                handleReload();
              }}
            >Reload</Button>
        </Box>
    </Box>;
};

export default RandomFlavorText;