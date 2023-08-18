import { Styles } from "./homepage-styles";

export const calendarStyles: Styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        margin: "auto",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
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
    }
};