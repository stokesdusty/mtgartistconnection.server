import { Styles } from "./homepage-styles";

export const artistStyles: Styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "auto",
        paddingTop: "64px",
        gap: 4,
    },
    bannerContainer: {
        display: "flex",
        justifyContent: "center",
        height: "250px",
        bgcolor: "#000",
        width: "100%",
    },
    infoSection: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "baseline",
        width: "80%",
        paddingBottom: 2,
    },
    backLink: {
        textDecoration: "none",
        color: "#000",
        fontSize: 16,
        top: 0,
        paddingLeft: "25px",
    },
    artistInfo: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 2,
        width: "50%",
    },
    infoRow: {
        display: "flex",
        flexDirection: "column",
    },
    link: {
        textDecoration: "none",
        fontSize: 18,
        fontWeight: "500",
        color: "#159947",
    },
    sectionHeader: {
        alignItems: "center"
    },
    signatureSection: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        padding: 4,
        paddingTop: "0px !important"
    },
    socialMedia: {
        display: "flex",
        flexDirection: "row",
        gap: 2,
        marginTop: 1,
    },
};
