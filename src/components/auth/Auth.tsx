import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    CircularProgress,
    FormControl,
    FormHelperText,
} from "@mui/material";
import { useState, useEffect } from "react";
import { ImBlogger } from "react-icons/im";
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
}

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const [loginMutation] = useMutation(USER_LOGIN);
    const [signupMutation] = useMutation(USER_SIGNUP);
    
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<Inputs>({
        defaultValues: { email: "", password: "" },
    });

    const styles = {
        container: {
            backgroundColor: "#507A60",
            minHeight: "100vh",
            padding: { xs: 2, md: 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        contentWrapper: {
            maxWidth: 600,
            width: "100%",
            padding: { xs: 3, md: 4 },
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        },
        logoSection: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 3,
            gap: 2,
        },
        logoIcon: {
            borderRadius: "50%",
            padding: "10px",
            background: "#507A60",
            color: "white",
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
            gap: 3,
        },
        formControl: {
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
        switchButton: {
            backgroundColor: "transparent",
            color: "#507A60",
            border: "2px solid #507A60",
            marginTop: 2,
            padding: "10px 24px",
            fontSize: "1rem",
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": {
                backgroundColor: "#507A60",
                color: "white",
            },
        },
        fieldSection: {
            marginBottom: 2,
        },
        errorMessage: {
            marginBottom: 2,
        },
        successMessage: {
            marginBottom: 2,
        },
        helperText: {
            color: "#666",
            fontSize: "0.875rem",
            marginTop: 1,
        },
        loadingContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 2,
        },
    };

    useEffect(() => {
        if (success) {
            setTimeout(() => setSuccess(false), 3000);
        }
    }, [success]);

    const onResponseReceived = (data: UserData) => {
        localStorage.setItem("userData", JSON.stringify(data));
        dispatch(login());
        setSuccess(true);
        return navigate("/blogs");
    };

    const onSubmit = async (inputData: Inputs) => {
        setIsLoading(true);
        setError(null);
        try {
            const { name, email, password } = inputData;
            const response = isSignup
                ? await signupMutation({
                      variables: { name, email, password },
                  })
                : await loginMutation({
                      variables: { email, password },
                  });
            if (response.data) {
                const userData = isSignup ? response.data.signup as UserData : response.data.login as UserData;
                onResponseReceived(userData);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const switchAuthMode = () => {
        setIsSignup(!isSignup);
        setError(null);
    };

    return (
        <Box sx={styles.container}>
            <Container maxWidth="sm">
                <Paper elevation={0} sx={styles.contentWrapper}>
                    <Box sx={styles.logoSection}>
                        <ImBlogger
                            size="30"
                            style={styles.logoIcon}
                        />
                        <Typography variant="h6" sx={{ color: "#507A60", fontWeight: 600 }}>
                            MtG Artist Connection
                        </Typography>
                    </Box>
                    
                    <Typography variant="h2" sx={styles.pageTitle}>
                        {isSignup ? "Sign Up" : "Login"}
                    </Typography>
                    
                    {error && (
                        <Alert severity="error" sx={styles.errorMessage}>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert severity="success" sx={styles.successMessage}>
                            Successfully logged in!
                        </Alert>
                    )}
                    
                    <Box sx={styles.form}>
                        <Typography sx={styles.sectionHeader} variant="h4">
                            {isSignup ? "Account Information" : "Login Credentials"}
                        </Typography>
                        
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {isSignup && (
                                <Box sx={styles.fieldSection}>
                                    <FormControl fullWidth sx={styles.formControl}>
                                        <TextField
                                            label="Name"
                                            fullWidth
                                            {...register("name", { required: true })}
                                            disabled={isSubmitting}
                                        />
                                        <FormHelperText sx={styles.helperText}>
                                            Enter your full name
                                        </FormHelperText>
                                    </FormControl>
                                </Box>
                            )}
                            
                            <Box sx={styles.fieldSection}>
                                <FormControl fullWidth sx={styles.formControl}>
                                    <TextField
                                        label="Email"
                                        fullWidth
                                        error={Boolean(errors.email)}
                                        helperText={errors.email ? "Invalid Email" : ""}
                                        {...register("email", {
                                            required: true,
                                            validate: (val: string) => emailRegex.test(val),
                                        })}
                                        disabled={isSubmitting}
                                    />
                                    <FormHelperText sx={styles.helperText}>
                                        Enter your email address
                                    </FormHelperText>
                                </FormControl>
                            </Box>
                            
                            <Box sx={styles.fieldSection}>
                                <FormControl fullWidth sx={styles.formControl}>
                                    <TextField
                                        label="Password"
                                        type="password"
                                        fullWidth
                                        error={Boolean(errors.password)}
                                        helperText={
                                            errors.password ? "Password must be at least 6 characters" : ""
                                        }
                                        {...register("password", { required: true, minLength: 6 })}
                                        disabled={isSubmitting}
                                    />
                                    <FormHelperText sx={styles.helperText}>
                                        {isSignup ? "Create a password (minimum 6 characters)" : "Enter your password"}
                                    </FormHelperText>
                                </FormControl>
                            </Box>
                            
                            {isLoading ? (
                                <Box sx={styles.loadingContainer}>
                                    <CircularProgress sx={{ color: "#507A60" }} />
                                </Box>
                            ) : (
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={styles.submitButton}
                                    fullWidth
                                    disabled={isSubmitting}
                                >
                                    {isSignup ? "Create Account" : "Sign In"}
                                </Button>
                            )}
                            
                            <Button
                                onClick={switchAuthMode}
                                sx={styles.switchButton}
                                fullWidth
                                disabled={isSubmitting}
                            >
                                Switch To {isSignup ? "Login" : "Sign Up"}
                            </Button>
                        </form>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Auth;