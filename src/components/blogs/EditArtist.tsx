import {
    Box,
    Button,
    Radio,
    RadioGroup,
    TextField,
    Typography,
    Container,
    Paper,
    FormControlLabel,
    FormControl,
    FormLabel,
    LinearProgress,
    Alert
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_ARTIST_BULK } from "../graphql/mutations";
import { GET_ARTIST_BY_ID } from "../graphql/queries";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

type Inputs = {
    name: string;
    email: string;
    filename: string;
    facebook: string;
    instagram: string;
    patreon: string;
    twitter: string;
    youtube: string;
    artstation: string;
    mountainmage: string;
    url: string;
    location: string;
    signingComment: string;
    bluesky: string;
    omalink: string;
    inprnt: string;
}

const EditArtist = () => {
    const { artistId } = useParams<{ artistId: string }>();
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

    const {
        register,
        handleSubmit,
        reset,
    } = useForm<Inputs>();

    const [updateArtist] = useMutation(UPDATE_ARTIST_BULK);
    const [signature, setSignature] = useState("false");
    const [artistProof, setArtistProof] = useState("false");
    const [isSigning, setIsSigning] = useState("false");
    const [marks, setMarks] = useState("false");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch artist data
    const { data, loading, error } = useQuery(GET_ARTIST_BY_ID, {
        variables: { id: artistId },
        skip: !isLoggedIn || !artistId,
    });

    // Populate form when data loads
    useEffect(() => {
        if (data?.artistById) {
            const artist = data.artistById;
            reset({
                name: artist.name || "",
                email: artist.email || "",
                filename: artist.filename || "",
                facebook: artist.facebook || "",
                instagram: artist.instagram || "",
                patreon: artist.patreon || "",
                twitter: artist.twitter || "",
                youtube: artist.youtube || "",
                artstation: artist.artstation || "",
                mountainmage: artist.mountainmage || "",
                url: artist.url || "",
                location: artist.location || "",
                signingComment: artist.signingComment || "",
                bluesky: artist.bluesky || "",
                omalink: artist.omalink || "",
                inprnt: artist.inprnt || "",
            });
            setSignature(artist.haveSignature || "false");
            setArtistProof(artist.artistProofs || "false");
            setIsSigning(artist.signing || "false");
            setMarks(artist.markssignatureservice || "false");
        }
    }, [data, reset]);

    const styles = {
        container: {
            backgroundColor: "#507A60",
            minHeight: "100vh",
            padding: { xs: 2, md: 4 },
        },
        contentWrapper: {
            maxWidth: 800,
            margin: "0 auto",
            padding: { xs: 3, md: 4 },
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        },
        pageTitle: {
            color: "#507A60",
            fontWeight: 700,
            fontSize: { xs: "2rem", md: "2.5rem" },
            marginBottom: 3,
            textAlign: "center",
        },
        sectionHeader: {
            color: "#507A60",
            fontWeight: 600,
            fontSize: "1.5rem",
            marginBottom: 2,
            marginTop: 3,
            paddingBottom: 1,
            borderBottom: "2px solid #507A60",
        },
        form: {
            display: "flex",
            flexDirection: "column",
            gap: 2,
        },
        textField: {
            "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": {
                    borderColor: "#507A60",
                },
                "&.Mui-focused fieldset": {
                    borderColor: "#507A60",
                },
            },
            "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                    color: "#507A60",
                },
            },
        },
        radioGroup: {
            "& .MuiFormControlLabel-root": {
                margin: "0 16px 0 0",
            },
            "& .MuiRadio-root": {
                color: "#507A60",
                "&.Mui-checked": {
                    color: "#507A60",
                },
            },
        },
        formControl: {
            marginTop: 2,
            marginBottom: 1,
        },
        formLabel: {
            color: "#507A60",
            fontWeight: 600,
            fontSize: "1rem",
            "&.Mui-focused": {
                color: "#507A60",
            },
        },
        submitButton: {
            backgroundColor: "#507A60",
            color: "white",
            marginTop: 3,
            padding: "12px 24px",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": {
                backgroundColor: "#3c5c48",
            },
        },
        fieldSection: {
            marginBottom: 2,
        },
        errorMessage: {
            color: "#d32f2f",
            textAlign: "center",
            padding: 4,
            backgroundColor: "rgba(211, 47, 47, 0.1)",
            borderRadius: 2,
            marginBottom: 2,
        },
        loadingContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
        },
    };

    const onSubmit = async({
        name,
        email,
        filename,
        facebook,
        instagram,
        patreon,
        twitter,
        youtube,
        artstation,
        mountainmage,
        url,
        location,
        signingComment,
        bluesky,
        omalink,
        inprnt,
    }: Inputs) => {
        try {
            await updateArtist({
                variables: {
                    id: artistId,
                    name,
                    email,
                    filename,
                    facebook,
                    instagram,
                    patreon,
                    twitter,
                    youtube,
                    artstation,
                    mountainmage,
                    url,
                    location,
                    signingComment,
                    artistProofs: artistProof,
                    haveSignature: signature,
                    signing: isSigning,
                    markssignatureservice: marks,
                    bluesky,
                    omalink,
                    inprnt,
                },
            });

            setSuccessMessage("Artist updated successfully!");

            // Navigate back to artist page after 1.5 seconds
            setTimeout(() => {
                navigate(`/artist/${name}`);
            }, 1500);
        } catch (err: any) {
            console.log(err.message);
        }
    };

    if (!isLoggedIn) {
        return (
            <Box sx={styles.container}>
                <Container maxWidth="md">
                    <Paper elevation={0} sx={styles.contentWrapper}>
                        <Typography sx={styles.errorMessage}>
                            Error: You must be logged in to edit an artist
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={styles.container}>
                <Container maxWidth="md">
                    <Paper elevation={0} sx={styles.contentWrapper}>
                        <Box sx={styles.loadingContainer}>
                            <LinearProgress sx={{ color: "#507A60", width: "300px" }} />
                        </Box>
                    </Paper>
                </Container>
            </Box>
        );
    }

    if (error || !data?.artistById) {
        return (
            <Box sx={styles.container}>
                <Container maxWidth="md">
                    <Paper elevation={0} sx={styles.contentWrapper}>
                        <Typography sx={styles.errorMessage}>
                            Error: {error?.message || "Artist not found"}
                        </Typography>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={styles.container}>
            <Container maxWidth="md">
                <Paper elevation={0} sx={styles.contentWrapper}>
                    <Typography variant="h2" sx={styles.pageTitle}>
                        Edit Artist
                    </Typography>

                    {successMessage && (
                        <Alert severity="success" sx={{ marginBottom: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} style={styles.form as React.CSSProperties}>
                        <Typography sx={styles.sectionHeader} variant="h4">
                            Basic Information
                        </Typography>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Artist Name"
                                {...register("name")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Email"
                                type="email"
                                {...register("email")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="File Name"
                                {...register("filename")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Location"
                                {...register("location")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Website URL"
                                {...register("url")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Typography sx={styles.sectionHeader} variant="h4">
                            Social Media Links
                        </Typography>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Facebook"
                                {...register("facebook")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Instagram"
                                {...register("instagram")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Twitter"
                                {...register("twitter")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="YouTube"
                                {...register("youtube")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="ArtStation"
                                {...register("artstation")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Patreon"
                                {...register("patreon")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Bluesky"
                                {...register("bluesky")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="OMA Link"
                                {...register("omalink")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="INPRNT Link"
                                {...register("inprnt")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Typography sx={styles.sectionHeader} variant="h4">
                            Signing Information
                        </Typography>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Signing Comment"
                                multiline
                                rows={3}
                                {...register("signingComment")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Box sx={styles.fieldSection}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="MountainMage Service"
                                {...register("mountainmage")}
                                sx={styles.textField}
                            />
                        </Box>

                        <Typography sx={styles.sectionHeader} variant="h4">
                            Artist Options
                        </Typography>

                        <FormControl sx={styles.formControl}>
                            <FormLabel sx={styles.formLabel}>Artist Proofs Available</FormLabel>
                            <RadioGroup
                                row
                                value={artistProof}
                                onChange={(e) => setArtistProof(e.target.value)}
                                sx={styles.radioGroup}
                            >
                                <FormControlLabel value="false" control={<Radio />} label="No" />
                                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl sx={styles.formControl}>
                            <FormLabel sx={styles.formLabel}>Have Signature Example</FormLabel>
                            <RadioGroup
                                row
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                sx={styles.radioGroup}
                            >
                                <FormControlLabel value="false" control={<Radio />} label="No" />
                                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl sx={styles.formControl}>
                            <FormLabel sx={styles.formLabel}>Offers Signing Services</FormLabel>
                            <RadioGroup
                                row
                                value={isSigning}
                                onChange={(e) => setIsSigning(e.target.value)}
                                sx={styles.radioGroup}
                            >
                                <FormControlLabel value="false" control={<Radio />} label="No" />
                                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl sx={styles.formControl}>
                            <FormLabel sx={styles.formLabel}>Mark's Signature Service</FormLabel>
                            <RadioGroup
                                row
                                value={marks}
                                onChange={(e) => setMarks(e.target.value)}
                                sx={styles.radioGroup}
                            >
                                <FormControlLabel value="false" control={<Radio />} label="No" />
                                <FormControlLabel value="true" control={<Radio />} label="Yes" />
                            </RadioGroup>
                        </FormControl>

                        <Button
                            type="submit"
                            variant="contained"
                            sx={styles.submitButton}
                            fullWidth
                        >
                            Update Artist
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default EditArtist;
