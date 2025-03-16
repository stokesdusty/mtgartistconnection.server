import {
    Box,
    Button,
    TextField,
    Typography,
    useTheme,
    useMediaQuery,
    Alert,
    CircularProgress,
  } from "@mui/material";
  import { useState, useEffect } from "react";
  import { authStyles } from "../../styles/auth-styles";
  import { ImBlogger } from "react-icons/im";
  import { useForm } from "react-hook-form";
  import { useMutation } from "@apollo/client";
  import { USER_LOGIN, USER_SIGNUP } from "../graphql/mutations";
  import { useDispatch } from "react-redux";
  import { login } from "../../store/auth-slice"; //Corrected import
  import { useNavigate } from "react-router-dom";
  import { SystemStyleObject } from "@mui/system";
  import { CSSProperties } from "react";
  
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
  
  const switchButtonStyles: SystemStyleObject = { //Corrected type
    width: "100%",
    marginTop: "1rem",
    borderRadius: "20px",
    color: "white",
    backgroundColor: "#004080",
    textTransform: "none",
  };
  
  const bloggerIconStyles: CSSProperties = {
    borderRadius: "50%",
    padding: "10px",
    background: "#6c5252"
  };
  
  const Auth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSignup, setIsSignup] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);
    const theme = useTheme();
    const isBelowMedium = useMediaQuery(theme.breakpoints.down("md"));
    const [loginMutation] = useMutation(USER_LOGIN); //added type
    const [signupMutation] = useMutation(USER_SIGNUP); //added type
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<Inputs>({
      defaultValues: { email: "", password: "" },
    });
  
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
          const userData = isSignup ? response.data.signup as UserData : response.data.login as UserData; //added type
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
    };
  
    return (
      <Box sx={authStyles.container}>
        <Box sx={authStyles.logoTitle}>
          <ImBlogger
            size="30"
            style={bloggerIconStyles} //updated variable
          />
          <Typography sx={authStyles.logoText}>MtG Artist Connection</Typography>
        </Box>
        <Box
          sx={{
            ...authStyles.formContainer,
            width: isBelowMedium ? "50%" : "200px",
          }}
        >
          <Typography sx={authStyles.logoText}>
            {isSignup ? "Sign Up" : "Login"}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          {success && (
            <Alert severity="success">Successfully logged in!</Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} style={authStyles.form as CSSProperties}>
            {isSignup && (
              <TextField
                margin="normal"
                InputProps={{ style: { borderRadius: 20 } }}
                aria-label="name"
                label="Name"
                {...register("name", { required: true })}
                fullWidth
                disabled={isSubmitting}
              />
            )}
            <TextField
              margin="normal"
              InputProps={{ style: { borderRadius: 20 } }}
              aria-label="email"
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
            <TextField
              margin="normal"
              InputProps={{ style: { borderRadius: 20 } }}
              aria-label="password"
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
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            ) : (
              <Button
                type="submit"
                variant="contained"
                sx={authStyles.submitButton} //This should be an object.
                disabled={isSubmitting}
              >
                Submit
              </Button>
            )}
            <Button
              onClick={switchAuthMode}
              sx={[authStyles.submitButton as SystemStyleObject, switchButtonStyles]} //Correct order
            >
              Switch To {isSignup ? "Login" : "Sign Up"}
            </Button>
          </form>
        </Box>
      </Box>
    );
  };
  
  export default Auth;
  