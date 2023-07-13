import { Styles } from "./homepage-styles";

export const authStyles:Styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        margin: "auto",
    },
    logoTitle: {
        display: "flex", 
        gap: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 1,
        marginBottom: 1,
    },
    logoText: {
        fontFamily: "Work Sans",
        fontSize: "30px",
        textAlign: "center",
    },
    formContainer: {
        border: "1px solid #ccc",
        borderRadius: 5,
        padding: 5,
        boxShadow: "5px 5px 10px #ccc",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        margin: "auto",
        marginTop: 5, 
        marginBottom: 5,
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        padding: 4,
        justifyContent: "center",
        alignItems: "center",
    },
    submitButton: {
        fontFamily: "Work Sans",
        marginTop: 1,
        marginBottom: 1,
        width: "200px",
        borderRadius: 10,
        bgcolor: "#273238",
        ":hover": {
            color: "white",
            bgcolor: "orangered",
            boxShadow: "10px 10px 20px #ccc",
        },
    },
    switchButton: {
        background: "transparent",
        color: "#273238",
        ":hover": {
            textDecoration: "underline",
            textUnderlineOffset: "5px",
        },
    },
    radioGroup: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
};