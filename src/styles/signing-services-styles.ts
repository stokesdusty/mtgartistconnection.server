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
    serviceContainerMobile: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
    },
    serviceStats: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 3,
        minWidth: "50%",
    },
    serviceGroupContainer: {
        backgroundColor: "#808080",
        borderRadius: "10px",
        marginBottom: "25px",
        paddingTop: "25px",
        paddingBottom: "25px",
        paddingLeft: "10px",
        paddingRight: "10px",
    },
    link: {
        color: "#083d1c",
        textDecoration: "none"
    }
};