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

    const styles = {
        container: {
            backgroundColor: "#fafafa",
            minHeight: "100vh",
            padding: { xs: 2, md: 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        contentWrapper: {
            maxWidth: 500,
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            border: "1px solid #eeeeee",
            overflow: "hidden",
        },
        header: {
            padding: { xs: 3, md: 4 },
            paddingBottom: 2,
        },
        title: {
            color: "#212121",
            fontWeight: 600,
            fontSize: { xs: "1.5rem", md: "1.875rem" },
            textAlign: "center",
            marginBottom: 1,
        },
        subtitle: {
            color: "#757575",
            fontSize: "0.875rem",
            textAlign: "center",
        },
        tabs: {
            borderBottom: "1px solid #eeeeee",
            "& .MuiTabs-indicator": {
                backgroundColor: "#2d4a36",
                height: 2,
            },
        },
        tab: {
            textTransform: "none",
            fontWeight: 500,
            fontSize: "1rem",
            color: "#757575",
            "&.Mui-selected": {
                color: "#2d4a36",
                fontWeight: 600,
            },
        },
        form: {
            padding: { xs: 3, md: 4 },
        },
        textField: {
            marginBottom: 2,
            "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                "&:hover fieldset": {
                    borderColor: "#2d4a36",
                },
                "&.Mui-focused fieldset": {
                    borderColor: "#2d4a36",
                },
            },
            "& .MuiInputLabel-root": {
                "&.Mui-focused": {
                    color: "#2d4a36",
                },
            },
        },
        submitButton: {
            backgroundColor: "#2d4a36",
            color: "white",
            marginTop: 2,
            padding: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": {
                backgroundColor: "#1a2d21",
            },
            "&:disabled": {
                backgroundColor: "#bdbdbd",
            },
        },
        errorAlert: {
            marginBottom: 2,
            borderRadius: "8px",
        },
        loadingContainer: {
            display: "flex",
            justifyContent: "center",
            padding: 2,
        },
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: 'login' | 'signup') => {
        setActiveTab(newValue);
        setError(null);
        reset();
    };

    const onResponseReceived = (authResponse: AuthResponse) => {
        dispatch(login({ token: authResponse.token, user: authResponse.user }));
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
        <Box sx={styles.container}>
            <Container maxWidth="sm">
                <Box sx={styles.contentWrapper}>
                    <Box sx={styles.header}>
                        <Typography variant="h4" sx={styles.title}>
                            Welcome to MTG Artist Connection
                        </Typography>
                        <Typography sx={styles.subtitle}>
                            {activeTab === 'login'
                                ? 'Sign in to your account to continue'
                                : 'Create an account to get started'}
                        </Typography>
                    </Box>

                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={styles.tabs}
                        centered
                    >
                        <Tab label="Login" value="login" sx={styles.tab} />
                        <Tab label="Sign Up" value="signup" sx={styles.tab} />
                    </Tabs>

                    <Box sx={styles.form}>
                        {error && (
                            <Alert severity="error" sx={styles.errorAlert}>
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
                                    sx={styles.textField}
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
                                sx={styles.textField}
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
                                sx={styles.textField}
                            />

                            {isLoading ? (
                                <Box sx={styles.loadingContainer}>
                                    <CircularProgress sx={{ color: "#2d4a36" }} />
                                </Box>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={isSubmitting}
                                    sx={styles.submitButton}
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