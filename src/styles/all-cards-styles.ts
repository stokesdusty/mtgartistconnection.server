import { Styles } from "./homepage-styles";

export const allCardsStyles: Styles = {
    container: {
        display: "flex",
        paddingTop: "64px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "auto",
        gap: 4,
    },
    bannerContainer: {
        display: "flex",
        justifyContent: "center",
        height: "250px",
        bgcolor: "#000",
        width: "100%",
    },
    cards: {
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        marginLeft: "auto",
        marginRight: "auto",
        justifyContent: "center",
        paddingBottom: 3,
    },
};