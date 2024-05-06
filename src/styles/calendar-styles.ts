import { Styles } from "./homepage-styles";

export const calendarStyles: Styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        margin: "auto",
        justifyContent: "center",
        paddingTop: "100px",
        alignItems: "center",
        gap: 4,
        minHeight: "75vh"
    },
    eventContainer: {
        // border: "1px solid rgba(0,0,0,0.5)",
        boxShadow: "5px 5px 20px #ccc",
        width: "80%",
        height: "auto",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        padding: 2
    },
    artistLink: {
        textDecoration: "none",
        fontWeight: "500",
        color: "#159947",
        fontSize: 20,
    },
    groupingContainer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "baseline",
        width: "100%",
        paddingBottom: 2,
    },
    groupingContainerSmall: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        paddingBottom: 2,
    },
    signingEventsContainer: {
        display: "flex",
        flexDirection: "column",
        margin: "auto",
        justifyContent: "space-between",
        paddingTop: "45px",
        alignItems: "center",
        width: "75vw",
    },
    linksContainer: {
        display: "flex",
        flexDirection: "column"
    },
    link: {
        textDecoration: "none",
        fontSize: 24,
        fontWeight: "500",
        color: "#083d1c",
        paddingBottom: "10px"
    },
};