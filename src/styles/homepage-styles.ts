import { SxProps } from '@mui/material';

export type Styles = {
    [key:string]: SxProps;
};

export const homepageStyles:Styles = {
    loadingContainerStyles: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
    },
    container: {
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: "75vh",
        paddingTop: "125px"
    },
    headerText: {
        fontSize: 54,
        fontWeight: "bold",
        margin: "auto",
        textAlign: "center"
    },
    count: {
        fontSize: 26,
        fontWeight: "bold",
        margin: "auto",
        textAlign: "center"
    },
    wrapper: {
        display: "flex",
        flexWrap: "wrap",
        justify: "center",
        gap: 4,
        alignItems: "center",
        padding: 6,
    },
    text: {
        fontSize: { lg: 50, md: 40, sm: 35, xs: 20},
        fontFamily: "Work Sans",
        fontWeight: "500",
        textShadow: "12px 10px 8px #ccc",
    } as SxProps,
    image: {
        boxShadow: "10px 10px 25px #000",
        borderRadius: 20,
    },
    footerContainer: {
        bgcolor: "#404040",
        color: "white",
        height: "100px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    footerButton: {
        borderRadius: 10,
        bgcolor: "blueviolet",
        width: 200,
        ":hover": {
            bgcolor: "#bd63fa",
        }
    },
    footerText: {
        fontFamily: "Work Sans",
        fontWeight: "500",
        fontSize: "1.2rem",
        color: "white",
    },
    textField: {
        width: "100%",
        margin: "auto",
        color: "#000"
    },
};