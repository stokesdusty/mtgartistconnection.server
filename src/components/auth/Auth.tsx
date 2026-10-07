import {
    Box,
    Button,
    TextField,
    CircularProgress,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { Check } from "@phosphor-icons/react";
import { USER_LOGIN, USER_SIGNUP } from "../graphql/mutations";
import { useDispatch } from "react-redux";
import { login } from "../../store/auth-slice";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authStyles as styles } from "../../styles/auth-styles";
import MonoLabel from "../shared/MonoLabel";
import SegmentedControl, { SegmentOption } from "../shared/SegmentedControl";

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

const TAB_OPTIONS: SegmentOption<'login' | 'signup'>[] = [
    { value: 'login', label: 'Sign in' },
    { value: 'signup', label: 'Sign up' },
];

/** Mono label stacked above a form control. */
const Field = ({ id, label, children }: { id: string; label: string; children: ReactNode }) => (
    <Box sx={styles.field}>
        <Box component="label" htmlFor={id} sx={styles.fieldLabel}>
            <MonoLabel tracking="tight">{label}</MonoLabel>
        </Box>
        {children}
    </Box>
);

const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
        searchParams.get('tab') === 'signup' ? 'signup' : 'login'
    );

    useEffect(() => {
        setActiveTab(searchParams.get('tab') === 'signup' ? 'signup' : 'login');
    }, [searchParams]);
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
        // Only allow same-site paths ("/settings"), never "//evil.com" or absolute URLs
        const redirect = searchParams.get('redirect');
        const isSafeRedirect = !!redirect && redirect.startsWith('/') && !redirect.startsWith('//');
        navigate(isSafeRedirect ? redirect : "/dashboard", { replace: true });
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

    const switchTab = (tab: 'login' | 'signup') => handleTabChange({} as React.SyntheticEvent, tab);
    const isSignup = activeTab === 'signup';
    const busy = isSubmitting || isLoading;

    return (
        <Box sx={styles.page}>
            <Box sx={styles.inner}>
                <Box sx={styles.header}>
                    <MonoLabel tone="accent" size={12} tracking="wide" sx={styles.eyebrow}>
                        MTG Artist Connection
                    </MonoLabel>
                    <Box component="h1" sx={styles.title}>
                        {isSignup ? (
                            <>Join the <Box component="span" sx={styles.titleMuted}>vault.</Box></>
                        ) : (
                            <>Welcome <Box component="span" sx={styles.titleMuted}>back.</Box></>
                        )}
                    </Box>
                    <Box component="p" sx={styles.subtitle}>
                        {isSignup
                            ? 'Create an account to get started'
                            : 'Sign in to your account to continue'}
                    </Box>
                </Box>

                <Box sx={styles.card}>
                    <SegmentedControl
                        options={TAB_OPTIONS}
                        value={activeTab}
                        onChange={switchTab}
                        fullWidth
                        aria-label="Sign in or sign up"
                        sx={styles.tabs}
                    />

                    {isSignup && (
                        <Box sx={styles.signupInfo}>
                            <Box component="p" sx={styles.signupInfoText}>
                                Create an account to receive optional email updates about:
                            </Box>
                            <Box component="ul" sx={styles.signupInfoList}>
                                <li><Check size={14} weight="bold" aria-hidden />Your favorite artists (when they have new events or information added)</li>
                                <li><Check size={14} weight="bold" aria-hidden />Signing events happening near you</li>
                                <li><Check size={14} weight="bold" aria-hidden />Site updates and new features</li>
                            </Box>
                            <Box component="p" sx={styles.signupInfoFootnote}>
                                All notifications are opt-in. We will never sell your data or share your email address with anyone.
                            </Box>
                        </Box>
                    )}

                    {error && (
                        <Box role="alert" sx={styles.error}>
                            {error}
                        </Box>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={styles.fields}>
                            {isSignup && (
                                <Field id="auth-name" label="Name">
                                    <TextField
                                        id="auth-name"
                                        fullWidth
                                        autoComplete="name"
                                        error={Boolean(errors.name)}
                                        helperText={errors.name ? "Name is required" : ""}
                                        {...register("name", { required: activeTab === 'signup' })}
                                        disabled={busy}
                                        sx={styles.input}
                                    />
                                </Field>
                            )}

                            <Field id="auth-email" label="Email">
                                <TextField
                                    id="auth-email"
                                    type="email"
                                    fullWidth
                                    autoComplete="email"
                                    error={Boolean(errors.email)}
                                    helperText={errors.email ? "Valid email is required" : ""}
                                    {...register("email", {
                                        required: true,
                                        validate: (val: string) => emailRegex.test(val),
                                    })}
                                    disabled={busy}
                                    sx={styles.input}
                                />
                            </Field>

                            <Field id="auth-password" label="Password">
                                <TextField
                                    id="auth-password"
                                    type="password"
                                    fullWidth
                                    autoComplete={isSignup ? "new-password" : "current-password"}
                                    error={Boolean(errors.password)}
                                    helperText={
                                        errors.password
                                            ? "Password must be at least 6 characters"
                                            : ""
                                    }
                                    {...register("password", { required: true, minLength: 6 })}
                                    disabled={busy}
                                    sx={styles.input}
                                />
                            </Field>
                        </Box>

                        <Button
                            type="submit"
                            disabled={busy}
                            startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
                            sx={styles.submitButton}
                        >
                            {isLoading
                                ? (isSignup ? 'Creating account…' : 'Signing in…')
                                : (isSignup ? 'Create Account' : 'Sign In')}
                        </Button>
                    </form>

                    <Box component="p" sx={styles.switchPrompt}>
                        {isSignup ? 'Already have an account? ' : 'New here? '}
                        <Box
                            component="button"
                            type="button"
                            onClick={() => switchTab(isSignup ? 'login' : 'signup')}
                            sx={styles.switchLink}
                        >
                            {isSignup ? 'Sign in' : 'Create an account'}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Auth;
