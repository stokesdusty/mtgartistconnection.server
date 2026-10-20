import { ReactNode, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useForm, UseFormRegister } from "react-hook-form";
import { useMutation, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";
import { Link as RouterLink, Navigate, useNavigate, useParams } from "react-router-dom";
import { UPDATE_ARTIST_BULK } from "../graphql/mutations";
import { GET_ARTIST_BY_ID } from "../graphql/queries";
import { RootState } from "../../store/store";
import { addArtistStyles as styles } from "../../styles/add-artist-styles";
import MonoLabel from "../shared/MonoLabel";
import SignatureExamplesManager from "../shared/SignatureExamplesManager";
import { SettingsSkeleton } from "../shared/Skeletons";
import { Field as SharedField, OptionRow, toYesNo, YesNo } from "./artistFormFields";

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
    scryfall_name: string;
}

const TEXT_FIELDS: (keyof Inputs)[] = [
    "name", "email", "filename", "facebook", "instagram", "patreon", "twitter", "youtube", "artstation",
    "mountainmage", "url", "location", "signingComment", "bluesky", "omalink", "inprnt", "scryfall_name",
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

const Field = (props: FieldProps) => <SharedField<Inputs> idPrefix="edit-artist" {...props} />;

const PageShell = ({ children }: { children: ReactNode }) => (
    <Box sx={styles.page}>
        <Box sx={styles.inner}>
            <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
                Admin
            </MonoLabel>
            {children}
        </Box>
    </Box>
);

const EditArtist = () => {
    const { artistId } = useParams<{ artistId: string }>();
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const isAdmin = useSelector((state: RootState) => state.auth.user?.role === "admin");

    const { data, loading, error } = useQuery(GET_ARTIST_BY_ID, {
        variables: { id: artistId },
        skip: !isLoggedIn || !isAdmin || !artistId,
        fetchPolicy: "network-only",
    });
    const artist = data?.artistById;

    if (!isLoggedIn || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return <SettingsSkeleton />;
    }

    if (error || !artist) {
        return (
            <PageShell>
                <Box component="h1" sx={[styles.title, { mb: "24px" }]}>Edit artist</Box>
                <Box role="alert" sx={[styles.message, styles.messageError]}>
                    {error?.message || "Artist not found."}
                </Box>
            </PageShell>
        );
    }

    // Keyed so moving to another artist starts a fresh form. Within one artist
    // the form keeps its edits when signature example changes refresh `artist`.
    return <EditArtistForm key={artist.id} artist={artist} />;
};

function EditArtistForm({ artist }: { artist: any }) {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<Inputs>({
        defaultValues: Object.fromEntries(TEXT_FIELDS.map((field) => [field, artist[field] || ""])) as Inputs,
    });

    const [updateArtist] = useMutation(UPDATE_ARTIST_BULK);
    const [signature, setSignature] = useState<YesNo>(() => toYesNo(artist.haveSignature));
    const [artistProof, setArtistProof] = useState<YesNo>(() => toYesNo(artist.artistProofs));
    const [isSigning, setIsSigning] = useState<YesNo>(() => toYesNo(artist.signing));
    const [marks, setMarks] = useState<YesNo>(() => toYesNo(artist.markssignatureservice));
    const [submitting, setSubmitting] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Removing the old signature photo clears haveSignature on the server.
    const savedHaveSignature = artist.haveSignature;
    useEffect(() => setSignature(toYesNo(savedHaveSignature)), [savedHaveSignature]);

    // Cancel the post-save redirect if the admin leaves first.
    const redirectTimer = useRef<ReturnType<typeof setTimeout>>();
    useEffect(() => () => clearTimeout(redirectTimer.current), []);

    const onSubmit = async (values: Inputs) => {
        setSaveError("");
        setSuccessMessage("");
        setSubmitting(true);
        try {
            await updateArtist({
                variables: {
                    id: artist.id,
                    ...values,
                    artistProofs: artistProof,
                    haveSignature: signature,
                    signing: isSigning,
                    markssignatureservice: marks,
                    scryfall_name: values.scryfall_name || undefined,
                },
            });
            setSuccessMessage("Saved. Taking you to the artist page…");
            redirectTimer.current = setTimeout(() => navigate(`/artist/${encodeURIComponent(values.name)}`), 1500);
        } catch (err: any) {
            setSaveError(err.message || "Couldn't save the artist. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <PageShell>
            <Box sx={styles.headerRow}>
                <Box component="h1" sx={styles.title}>Edit artist</Box>
                <Box component={RouterLink} to={`/artist/${encodeURIComponent(artist.name)}`} sx={styles.viewLink}>
                    View artist page →
                </Box>
            </Box>
            <Box component="p" sx={styles.intro}>
                Changes to {artist.name}'s profile go live when you save.
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={styles.form}>
                <Box component="section" aria-labelledby="edit-artist-basic" sx={styles.panel}>
                    <Box component="h2" id="edit-artist-basic" sx={styles.sectionTitle}>Basic information</Box>
                    <Box component="p" sx={styles.sectionIntro}>Name, contact and where the artist's image lives.</Box>
                    <Box sx={styles.fieldGrid}>
                        <Field name="name" label="Artist name" register={register} />
                        <Field name="email" label="Email" type="email" register={register} />
                        <Field name="filename" label="File name" register={register} />
                        <Field name="location" label="Location" register={register} />
                        <Field name="url" label="Website URL" placeholder="https://" wide register={register} />
                        <Field name="scryfall_name" label="Scryfall name" placeholder="Only if different from the display name" wide register={register} />
                    </Box>
                </Box>

                <Box component="section" aria-labelledby="edit-artist-social" sx={styles.panel}>
                    <Box component="h2" id="edit-artist-social" sx={styles.sectionTitle}>Social links</Box>
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
                        <Field name="omalink" label="OMA link" wide register={register} />
                    </Box>
                </Box>

                <Box component="section" aria-labelledby="edit-artist-signing" sx={styles.panel}>
                    <Box component="h2" id="edit-artist-signing" sx={styles.sectionTitle}>Signing</Box>
                    <Box component="p" sx={styles.sectionIntro}>How collectors can get cards signed.</Box>
                    <Box sx={styles.fieldGrid}>
                        <Field name="signingComment" label="Signing comment" multiline wide register={register} />
                        <Field name="mountainmage" label="MountainMage service" wide register={register} />
                    </Box>
                </Box>

                <Box component="section" aria-labelledby="edit-artist-options" sx={styles.panel}>
                    <Box component="h2" id="edit-artist-options" sx={styles.sectionTitle}>Artist options</Box>
                    <Box component="p" sx={styles.sectionIntro}>Flags used for homepage filters and the artist page.</Box>
                    <Box sx={styles.optionList}>
                        <OptionRow label="Artist proofs available" value={artistProof} onChange={setArtistProof} />
                        <OptionRow label="Offers signing services" value={isSigning} onChange={setIsSigning} />
                        <OptionRow label="Mark's Signature Service" value={marks} onChange={setMarks} />
                        <OptionRow label="Legacy signature image" value={signature} onChange={setSignature} />
                    </Box>
                </Box>

                <Box sx={styles.actions}>
                    {saveError ? (
                        <Box role="alert" sx={[styles.message, styles.messageError]}>{saveError}</Box>
                    ) : successMessage ? (
                        <Box role="status" sx={[styles.message, styles.messageSuccess]}>{successMessage}</Box>
                    ) : null}
                    <Box component="button" type="submit" disabled={submitting} sx={[styles.button, styles.actionsButton]}>
                        {submitting ? "Saving…" : "Save changes"}
                    </Box>
                </Box>
            </Box>

            {/* Outside the form: these save on their own, and Enter in a label shouldn't submit the profile. */}
            <Box component="section" aria-labelledby="edit-artist-signatures" sx={[styles.panel, { mt: "20px" }]}>
                <Box component="h2" id="edit-artist-signatures" sx={styles.sectionTitle}>Signature examples</Box>
                <Box component="p" sx={styles.sectionIntro}>
                    Each kind of signature the artist offers. The first is shown largest on their page. These save as soon
                    as you add or change them.
                </Box>
                <SignatureExamplesManager artistId={artist.id} examples={artist.signatureExamples ?? []} />
            </Box>
        </PageShell>
    );
}

export default EditArtist;
