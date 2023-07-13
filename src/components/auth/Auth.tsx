import { Box, Button, InputLabel, TextField, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useState } from "react";
import { authStyles } from "../../styles/auth-styles";
import { ImBlogger } from "react-icons/im";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { USER_LOGIN, USER_SIGNUP } from "../graphql/mutations";
import { useDispatch, useSelector } from "react-redux";
import { authActions } from "../../store/auth-slice";
import { useNavigate } from "react-router-dom";

type Inputs = {
    name: string;
    email: string;
    password: string;
}

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoggedIn = useSelector((state: any) => state.isLoggedIn );
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();
    const [login] = useMutation(USER_LOGIN);
    const [signup] = useMutation(USER_SIGNUP);
    const [isSignup, setIsSignup] = useState(false);
    const theme = useTheme();
    const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));
    const OnResponseReceived = (data: any) => {
        if (data.signup) {
            const { id, email, name } = data.signup;
            localStorage.setItem('userData', JSON.stringify({id, name, email})); 
        } else {
            const { id, email, name } = data.login;
            localStorage.setItem('userData', JSON.stringify({id, name, email})); 
        }
        dispatch(authActions.login());
        return navigate("/blogs");
    }
    const onSubmit = async({name, email, password}: Inputs) => {
        if (isSignup) {
            //signup
            try {
                const response = await signup({
                    variables: {
                        name,
                        email,
                        password
                    },
                });
                if (response.data) {
                    OnResponseReceived(response.data);
                }
            } catch (err: any) {
                console.log(err.message);
            }
        } else {
            // login
            try {
                const response = await login({
                    variables: {
                        email,
                        password
                    },
                });
                if (response.data) {
                    OnResponseReceived(response.data);
                }
            } catch (err: any) {
                console.log(err.message);
            }
        }
    };

    if (!isLoggedIn) return <p>Error</p>;
    return <Box sx={authStyles.container}>
        <Box sx={authStyles.logoTitle}>
            <ImBlogger size="30" style={{borderRadius: "50%", padding: "10px", background:"#6c5252"}} />
            <Typography sx={authStyles.logoText}>MtG Artist Connection</Typography>
        </Box>
        <Box sx={{...authStyles.formContainer,  width: isBelowMedium ? "50%" : "200px" }}>
            <Typography sx={authStyles.logoText}>
               { isSignup ? "Sign Up" : "Login" }
            </Typography>{" "}
            {/* @ts-ignore */}
            <form onSubmit={handleSubmit(onSubmit)} style={authStyles.form}>
                { isSignup &&
                    <>
                        <InputLabel aria-label="name"></InputLabel>
                        <TextField 
                            margin="normal" 
                            InputProps={{style: {borderRadius: 20}}}
                            aria-label="name" 
                            label="Name" 
                            {...register("name")}
                        />
                    </>
                }                   
                <InputLabel aria-label="email"></InputLabel>
                <TextField 
                    helperText={Boolean(errors.email) ? "Invalid Email" : ""}
                    error={Boolean(errors.email)}
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="email" 
                    label="Email" 
                    {...register("email", {
                        required: true, 
                        validate: (val: string) => 
                            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
                                val
                            ),
                    })}
                />
                <InputLabel aria-label="password"></InputLabel>
                <TextField 
                    helperText={Boolean(errors.password) ? "Password must be at least 6 characters" : ""}
                    error={Boolean(errors.password)}
                    margin="normal" 
                    InputProps={{style: {borderRadius: 20}}}
                    aria-label="password" 
                    label="Password" 
                    type="password"
                    {...register("password", {required: true, minLength: 6})}
                />
                <Button type="submit" variant="contained" sx={authStyles.submitButton}>Submit</Button>
                <Button 
                    onClick={() => setIsSignup((prev) => !prev)}
                    // @ts-ignore
                    sx={{...authStyles.submitButton, ...authStyles.switchButton}}
                >
                    Switch To {isSignup ? "Login" : "Sign Up"}
                </Button>
            </form>
        </Box>
    </Box>;
};

export default Auth;