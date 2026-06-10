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
    Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { ADD_ARTIST } from "../graphql/mutations";
import { GET_ARTISTS_PAGE, GET_ARTIST_FILTER_FLAGS } from "../graphql/queries";
import { useSelector } from "react-redux";
import { colors } from "../../styles/design-tokens";
import { useState } from "react";
import { RootState } from "../../store/store";
import { Navigate } from "react-router-dom";

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
    artistProofs: string;
    haveSignature: string;
    signing: string;
    markssignatureservice: string;
    bluesky: string;
    inprnt: string;
}

const styles = {
    container: {
        backgroundColor: colors.primary.main,
        minHeight: "100vh",
        padding: { xs: 2, md: 4 },
    },
    contentWrapper: {
        maxWidth: 800,
        margin: "0 auto",
        padding: { xs: 3, md: 4 },
        backgroundColor: colors.neutral.white,
        borderRadius: 2,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    },
    pageTitle: {
        color: colors.primary.main,
        fontWeight: 700,
        fontSize: { xs: "2rem", md: "2.5rem" },
        marginBottom: 3,
        textAlign: "center",
    },
    sectionHeader: {
        color: colors.primary.main,
        fontWeight: 600,
        fontSize: "1.5rem",
        marginBottom: 2,
        marginTop: 3,
        paddingBottom: 1,
        borderBottom: `2px solid ${colors.primary.main}`,
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
                borderColor: colors.primary.main,
            },
            "&.Mui-focused fieldset": {
                borderColor: colors.primary.main,
            },
        },
        "& .MuiInputLabel-root": {
            "&.Mui-focused": {
                color: colors.primary.main,
            },
        },
    },
    radioGroup: {
        "& .MuiFormControlLabel-root": {
            margin: "0 16px 0 0",
        },
        "& .MuiRadio-root": {
            color: colors.primary.main,
            "&.Mui-checked": {
                color: colors.primary.main,
            },
        },
    },
    formControl: {
        marginTop: 2,
        marginBottom: 1,
    },
    formLabel: {
        color: colors.primary.main,
        fontWeight: 600,
        fontSize: "1rem",
        "&.Mui-focused": {
            color: colors.primary.main,
        },
    },
    submitButton: {
        backgroundColor: colors.primary.main,
        color: colors.neutral.white,
        marginTop: 3,
        padding: "12px 24px",
        fontSize: "1.1rem",
        fontWeight: 600,
        borderRadius: "8px",
        "&:hover": {
            backgroundColor: colors.primary.dark,
        },
    },
    fieldSection: {
        marginBottom: 2,
    },
};

const defaultValues: Inputs = {
    name: "",
    email: "",
    filename: "",
    facebook: "",
    instagram: "",
    patreon: "",
    twitter: "",
    youtube: "",
    artstation: "",
    mountainmage: "",
    url: "",
    location: "",
    signingComment: "",
    artistProofs: "",
    haveSignature: "",
    signing: "",
    markssignatureservice: "",
    bluesky: "",
    inprnt: "",
};

interface FormBodyProps {
    onSuccess: (artistName: string) => void;
}

const AddArtistFormBody = ({ onSuccess }: FormBodyProps) => {
    const { register, handleSubmit } = useForm<Inputs>({ defaultValues });
    const [addArtist] = useMutation(ADD_ARTIST);
    const [signature, setSignature] = useState("false");
    const [artistProof, setArtistProof] = useState("false");
    const [isSigning, setIsSigning] = useState("false");
    const [marks, setMarks] = useState("false");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async ({
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
        inprnt,
    }: Inputs) => {
        setError(null);
        setSubmitting(true);
        try {
            await addArtist({
                refetchQueries: [
                    { query: GET_ARTISTS_PAGE, variables: { offset: 0, limit: 60 } },
                    { query: GET_ARTIST_FILTER_FLAGS },
                ],
                variables: {
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
                    inprnt,
                },
            });
            onSuccess(name);
        } catch (err: any) {
            setError(err.message || "Failed to add artist. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form as React.CSSProperties}>
            {error && (
                <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>
            )}

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
                disabled={submitting}
            >
                {submitting ? "Adding..." : "Add Artist"}
            </Button>
        </form>
    );
};

const AddArtist = () => {
    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
    const user = useSelector((state: RootState) => state.auth.user);
    const isAdmin = user?.role === 'admin';
    const [formKey, setFormKey] = useState(0);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!isLoggedIn || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    const handleSuccess = (artistName: string) => {
        setSuccessMessage(`"${artistName}" added successfully.`);
        setFormKey(k => k + 1);
    };

    return (
        <Box sx={styles.container}>
            <Container maxWidth="md">
                <Paper elevation={0} sx={styles.contentWrapper}>
                    <Typography variant="h2" sx={styles.pageTitle}>
                        Add Artist
                    </Typography>
                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
                            {successMessage}
                        </Alert>
                    )}
                    <AddArtistFormBody key={formKey} onSuccess={handleSuccess} />
                </Paper>
            </Container>
        </Box>
    );
};

export default AddArtist;
