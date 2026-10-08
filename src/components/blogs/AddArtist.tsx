import { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { useForm, UseFormRegister } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { Box, TextField } from "@mui/material";
import { ADD_ARTIST } from "../graphql/mutations";
import { GET_ARTISTS_PAGE, GET_ARTIST_FILTER_FLAGS } from "../graphql/queries";
import { RootState } from "../../store/store";
import { addArtistStyles as styles } from "../../styles/add-artist-styles";
import MonoLabel from "../shared/MonoLabel";
import SegmentedControl from "../shared/SegmentedControl";

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

type YesNo = "true" | "false";

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

const YES_NO_OPTIONS = [
    { value: "false" as const, label: "No" },
    { value: "true" as const, label: "Yes" },
];

interface FieldProps {
    name: keyof Inputs;
    label: string;
    register: UseFormRegister<Inputs>;
    type?: string;
    placeholder?: string;
    multiline?: boolean;
    wide?: boolean;
}

const Field = ({ name, label, register, type, placeholder, multiline, wide }: FieldProps) => {
    const id = `add-artist-${name}`;
    return (
        <Box sx={[styles.field, !!wide && styles.fieldWide]}>
            <Box component="label" htmlFor={id} sx={styles.fieldLabel}>
                <MonoLabel tracking="tight">{label}</MonoLabel>
            </Box>
            <TextField
                id={id}
                type={type}
                fullWidth
                size="small"
                placeholder={placeholder}
                multiline={multiline}
                minRows={multiline ? 3 : undefined}
                {...register(name)}
                sx={styles.input}
            />
        </Box>
    );
};

interface OptionRowProps {
    label: string;
    value: YesNo;
    onChange: (value: YesNo) => void;
}

const OptionRow = ({ label, value, onChange }: OptionRowProps) => (
    <Box sx={styles.optionRow}>
        <Box component="span" sx={styles.optionLabel}>{label}</Box>
        <SegmentedControl options={YES_NO_OPTIONS} value={value} onChange={onChange} aria-label={label} />
    </Box>
);

interface FormBodyProps {
    onSuccess: (artistName: string) => void;
}

const AddArtistFormBody = ({ onSuccess }: FormBodyProps) => {
    const { register, handleSubmit } = useForm<Inputs>({ defaultValues });
    const [addArtist] = useMutation(ADD_ARTIST);
    const [signature, setSignature] = useState<YesNo>("false");
    const [artistProof, setArtistProof] = useState<YesNo>("false");
    const [isSigning, setIsSigning] = useState<YesNo>("false");
    const [marks, setMarks] = useState<YesNo>("false");
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
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={styles.form}>
            {error && (
                <Box role="alert" sx={[styles.message, styles.messageError]}>{error}</Box>
            )}

            <Box component="section" aria-labelledby="add-artist-basic" sx={styles.panel}>
                <Box component="h2" id="add-artist-basic" sx={styles.sectionTitle}>Basic information</Box>
                <Box component="p" sx={styles.sectionIntro}>Name, contact and where the artist's image lives.</Box>
                <Box sx={styles.fieldGrid}>
                    <Field name="name" label="Artist name" register={register} />
                    <Field name="email" label="Email" type="email" register={register} />
                    <Field name="filename" label="File name" register={register} />
                    <Field name="location" label="Location" register={register} />
                    <Field name="url" label="Website URL" placeholder="https://" wide register={register} />
                </Box>
            </Box>

            <Box component="section" aria-labelledby="add-artist-social" sx={styles.panel}>
                <Box component="h2" id="add-artist-social" sx={styles.sectionTitle}>Social links</Box>
                <Box component="p" sx={styles.sectionIntro}>Leave blank anything the artist doesn't use.</Box>
                <Box sx={styles.fieldGrid}>
                    <Field name="facebook" label="Facebook" register={register} />
                    <Field name="instagram" label="Instagram" register={register} />
                    <Field name="twitter" label="Twitter" register={register} />
                    <Field name="bluesky" label="Bluesky" register={register} />
                    <Field name="youtube" label="YouTube" register={register} />
                    <Field name="artstation" label="ArtStation" register={register} />
                    <Field name="patreon" label="Patreon" register={register} />
                    <Field name="inprnt" label="INPRNT link" register={register} />
                </Box>
            </Box>

            <Box component="section" aria-labelledby="add-artist-signing" sx={styles.panel}>
                <Box component="h2" id="add-artist-signing" sx={styles.sectionTitle}>Signing</Box>
                <Box component="p" sx={styles.sectionIntro}>How collectors can get cards signed.</Box>
                <Box sx={styles.fieldGrid}>
                    <Field name="signingComment" label="Signing comment" multiline wide register={register} />
                    <Field name="mountainmage" label="MountainMage service" wide register={register} />
                </Box>
            </Box>

            <Box component="section" aria-labelledby="add-artist-options" sx={styles.panel}>
                <Box component="h2" id="add-artist-options" sx={styles.sectionTitle}>Artist options</Box>
                <Box component="p" sx={styles.sectionIntro}>Flags used for homepage filters and the artist page.</Box>
                <Box sx={styles.optionList}>
                    <OptionRow label="Artist proofs available" value={artistProof} onChange={setArtistProof} />
                    <OptionRow label="Have signature example" value={signature} onChange={setSignature} />
                    <OptionRow label="Offers signing services" value={isSigning} onChange={setIsSigning} />
                    <OptionRow label="Mark's Signature Service" value={marks} onChange={setMarks} />
                </Box>
            </Box>

            <Box sx={styles.actions}>
                <Box component="button" type="submit" disabled={submitting} sx={styles.button}>
                    {submitting ? "Adding…" : "Add artist"}
                </Box>
            </Box>
        </Box>
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
        <Box sx={styles.page}>
            <Box sx={styles.inner}>
                <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
                    Admin
                </MonoLabel>
                <Box component="h1" sx={styles.title}>
                    Add artist
                </Box>
                <Box component="p" sx={styles.intro}>
                    Create a new artist profile. Anything left blank can be filled in later from the artist's edit page.
                </Box>

                {successMessage && (
                    <Box role="status" sx={[styles.message, styles.messageSuccess, styles.successSpacing]}>
                        <Box
                            component="button"
                            type="button"
                            aria-label="Dismiss"
                            onClick={() => setSuccessMessage(null)}
                            sx={styles.messageDismiss}
                        >
                            ×
                        </Box>
                        {successMessage}
                    </Box>
                )}
                <AddArtistFormBody key={formKey} onSuccess={handleSuccess} />
            </Box>
        </Box>
    );
};

export default AddArtist;
