import { SystemStyleObject } from '@mui/system';

export const signingServicesStyles:Record<string, SystemStyleObject> = {
    container: {
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        minHeight: "75vh",
        paddingTop: "125px"
    },
    text: {
        fontSize: "1.2rem",
    },
    serviceGroupContainer: {
        display: "flex",
        flexDirection: "column",
        padding: 2,
        gap: 1,
    },
    serviceContainer: {
        display: "flex",
        gap: 1,
        padding: 2,
    },
    serviceStats: {
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "space-around",
        gap: 2,
    },
    serviceInfo: {
        display: "flex",
        flexDirection: "column",
        flex: 3,
    },
    link: {
        color: "blue"
    },
};
