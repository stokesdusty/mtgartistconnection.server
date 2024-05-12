import { CSSProperties } from "react";
import { Styles } from "./homepage-styles";

export const artistGridStyles: Styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        width: "200px",
        height: "250px",
        gap: 1,
        alignItems: "center",
        justifyContent: "center",
        margin: "auto",
    },
    imageBox: {
        height: "200px",
        width: "200px",
        objectFit: "cover",
    },
    link: {
        textDecoration: "none",
        color: "#000",
        display: "flex",
        flexDirection: "column",
        gap: 2,
    },
    text: {
        display: "flex",
        margin: "auto",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "500",
    }
};

export const gridHtmlElementStyles: { [key: string]: CSSProperties } = {
    img: {
        borderRadius: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: 1

    },
};