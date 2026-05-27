import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { USER_LOGIN, USER_SIGNUP } from "../graphql/mutations";
import { useDispatch } from "react-redux";
import { login } from "../../store/auth-slice";
import { useNavigate } from "react-router-dom";
import { authStyles } from "../../styles/auth-styles";

interface Inputs {
    name?: string;
    email: string;
    password: string;
}

interface UserData {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthResponse {
    token: string;
    refreshToken: string;
    user: UserData;
}

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loginMutation] = useMutation(USER_LOGIN);
    const [signupMutation] = useMutation(USER_SIGNUP);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<Inputs>({
        defaultValues: { name: "", email: "", password: "" },
    });


    const handleTabChange = (_: React.SyntheticEvent, newValue: 'login' | 'signup') => {
        setActiveTab(newValue);
        setError(null);
        reset();
    };

    const onResponseReceived = (authResponse: AuthResponse) => {
        dispatch(login({ token: authResponse.token, refreshToken: authResponse.refreshToken, user: authResponse.user }));
        navigate("/");
    };

    const onSubmit = async (inputData: Inputs) => {
        setIsLoading(true);
        setError(null);
        try {
            const { name, email, password } = inputData;
            const response = activeTab === 'signup'
                ? await signupMutation({
                      variables: { name, email, password },
                  })
                : await loginMutation({
                      variables: { email, password },
                  });
            if (response.data) {
                const authResponse = activeTab === 'signup'
                    ? response.data.signup as AuthResponse
                    : response.data.login as AuthResponse;
                onResponseReceived(authResponse);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={authStyles.container}>
            <Container maxWidth="sm">
                <Box sx={authStyles.contentWrapper}>
                    <Box sx={authStyles.header}>
                        <Typography variant="h4" sx={authStyles.title}>
                            Welcome to MTG Artist Connection
                        </Typography>
                        <Typography sx={authStyles.subtitle}>
                            {activeTab === 'login'
                                ? 'Sign in to your account to continue'
                                : 'Create an account to get started'}
                        </Typography>
                    </Box>

                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={authStyles.tabs}
                        centered
                    >
                        <Tab label="Login" value="login" sx={authStyles.tab} />
                        <Tab label="Sign Up" value="signup" sx={authStyles.tab} />
                    </Tabs>

                    <Box sx={authStyles.form}>
                        {activeTab === 'signup' && (
                            <Box sx={authStyles.signupInfoBox}>
                                <Typography sx={authStyles.signupInfoText}>
                                    Create an account to receive optional email updates about:
                                </Typography>
                                <Box component="ul" sx={authStyles.signupInfoList}>
                                    <li>Your favorite artists (when they have new events or information added)</li>
                                    <li>Signing events happening near you</li>
                                    <li>Site updates and new features</li>
                                </Box>
                                <Typography sx={authStyles.signupInfoFootnote}>
                                    All notifications are opt-in. We will never sell your data or share your email address with anyone.
                                </Typography>
                            </Box>
                        )}

                        {error && (
                            <Alert severity="error" sx={authStyles.errorAlert}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)}>
                            {activeTab === 'signup' && (
                                <TextField
                                    label="Name"
                                    fullWidth
                                    error={Boolean(errors.name)}
                                    helperText={errors.name ? "Name is required" : ""}
                                    {...register("name", { required: activeTab === 'signup' })}
                                    disabled={isSubmitting || isLoading}
                                    sx={authStyles.textField}
                                />
                            )}

                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                error={Boolean(errors.email)}
                                helperText={errors.email ? "Valid email is required" : ""}
                                {...register("email", {
                                    required: true,
                                    validate: (val: string) => emailRegex.test(val),
                                })}
                                disabled={isSubmitting || isLoading}
                                sx={authStyles.textField}
                            />

                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                error={Boolean(errors.password)}
                                helperText={
                                    errors.password
                                        ? "Password must be at least 6 characters"
                                        : ""
                                }
                                {...register("password", { required: true, minLength: 6 })}
                                disabled={isSubmitting || isLoading}
                                sx={authStyles.textField}
                            />

                            {isLoading ? (
                                <Box sx={authStyles.loadingContainer}>
                                    <CircularProgress sx={authStyles.spinner} />
                                </Box>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={isSubmitting}
                                    sx={authStyles.submitButton}
                                >
                                    {activeTab === 'signup' ? 'Create Account' : 'Sign In'}
                                </Button>
                            )}
                        </form>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Auth;