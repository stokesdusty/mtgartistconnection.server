import { Styles } from "./homepage-styles";

export const signingServicesStyles: Styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        margin: "auto",
        padding: 4,
        paddingTop: "100px",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
        width: "60%"
    },
    text: {
        fontWeight: "600",
        fontSize: 20,
        textAlign: "justify"
    },
    serviceContainer: {
        display: "flex",
        flexDirection: "row",
        gap: 4,
    },
    serviceStats: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 3,
        minWidth: "50%",
    }
};