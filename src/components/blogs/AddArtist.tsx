import { Box, Button, InputLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import { authStyles } from "../../styles/auth-styles";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { ADD_ARTIST } from "../graphql/mutations";
import { useSelector } from "react-redux";

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
}

const AddArtist = () => {
    const isLoggedIn = useSelector((state: any) => state.isLoggedIn );
    const {
        register,
        handleSubmit,
    } = useForm<Inputs>();
    const [ addArtist ] = useMutation(ADD_ARTIST);
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
        artistProofs,
        haveSignature,
        signing,
        markssignatureservice,    
    }: Inputs) => {
            try {
                await addArtist({
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
                        artistProofs,
                        haveSignature,
                        signing,
                        markssignatureservice, 
                    },
                });
            } catch (err: any) {
                console.log(err.message);
            }
    };

    if (!isLoggedIn) {
        return <p>Error</p>
    }
    return <Box sx={authStyles.container}>
        <Box sx={authStyles.formContainer}>
            <Typography sx={authStyles.logoText}>
              Add Artist
            </Typography>{" "}
            {/* @ts-ignore */}
            <form onSubmit={handleSubmit(onSubmit)} style={authStyles.form}>
                <InputLabel aria-label="name"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="name" 
                    label="Name" 
                    {...register("name")}
                />           
                <InputLabel aria-label="email"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="email" 
                    label="Email" 
                    {...register("email")}
                />
                <InputLabel aria-label="filename"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="filename" 
                    label="File Name" 
                    {...register("filename")}
                />
                <InputLabel aria-label="facebook"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="facebook" 
                    label="Facebook" 
                    {...register("facebook")}
                />
                <InputLabel aria-label="instagram"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="instagram" 
                    label="Instagram" 
                    {...register("instagram")}
                />
                <InputLabel aria-label="patreon"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="patreon" 
                    label="Patreon" 
                    {...register("patreon")}
                />
                <InputLabel aria-label="twitter"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="twitter" 
                    label="Twitter" 
                    {...register("twitter")}
                />
                <InputLabel aria-label="youtube"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="youtube" 
                    label="Youtube" 
                    {...register("youtube")}
                />
                <InputLabel aria-label="artstation"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="artstation" 
                    label="Artstation" 
                    {...register("artstation")}
                />
                <InputLabel aria-label="mountainmage"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="mountainmage" 
                    label="Mountainmage" 
                    {...register("mountainmage")}
                />
                <InputLabel aria-label="url"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="url" 
                    label="URL" 
                    {...register("url")}
                />
                <InputLabel aria-label="location"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="location" 
                    label="Location" 
                    {...register("location")}
                />
                <InputLabel aria-label="signingComment"></InputLabel>
                <TextField 
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="signingComment" 
                    label="Signing Comment" 
                    {...register("signingComment")}
                />
                <label>Artist Proofs</label>
                <RadioGroup
                    aria-label="artistProofs"
                    defaultValue={false}
                    sx={authStyles.radioGroup}
                    {...register("artistProofs")}
                >
                    <Radio value={false} /><label>No</label>
                    <Radio value={true} /><label>Yes</label>
                </RadioGroup>
                <label>Have Signature</label>
                <RadioGroup
                    aria-label="haveSignature"
                    defaultValue={false}
                    sx={authStyles.radioGroup}
                    {...register("haveSignature")}
                >
                    <Radio value={false} /><label>No</label>
                    <Radio value={true} /><label>Yes</label>
                </RadioGroup>
                <label>Signing</label>
                <RadioGroup
                    aria-label="signing"
                    defaultValue={false}
                    sx={authStyles.radioGroup}
                    {...register("signing")}
                >
                    <Radio value={false} /><label>No</label>
                    <Radio value={true} /><label>Yes</label>
                </RadioGroup>
                <label>Marks Signature Service</label>
                <RadioGroup
                    aria-label="markssignatureservice"
                    defaultValue={false}
                    sx={authStyles.radioGroup}
                    {...register("markssignatureservice")}
                >
                    <Radio value={false} /><label>No</label>
                    <Radio value={true} /><label>Yes</label>
                </RadioGroup>
                <Button type="submit" variant="contained" sx={authStyles.submitButton}>Submit</Button>
            </form>
        </Box>
    </Box>;
};

export default AddArtist;

