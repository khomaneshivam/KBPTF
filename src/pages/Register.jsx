import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../api/auth"; // Imports from our new api/auth.js
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    companyName: "", // ✅ ADDED: Company Name field
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Validation logic
  const validate = () => {
    const tempErrors = {};

    if (!formData.name.trim()) tempErrors.name = "Full Name is required.";
    // ✅ ADDED: Company Name validation
    if (!formData.companyName.trim())
      tempErrors.companyName = "Company Name is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      tempErrors.email = "Enter a valid email address.";

    // Simple password check (6+ characters)
    if (formData.password.length < 6)
      tempErrors.password = "Password must be at least 6 characters.";

    if (formData.password !== formData.confirmPassword)
      tempErrors.confirmPassword = "Passwords do not match!";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // ✅ Handle change
  const handleChange = (e) => {
    setErrors({ ...errors, [e.target.name]: "" });
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // ✅ ADDED: companyName to the data
    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      companyName: formData.companyName,
    };

    try {
      // The new api/auth.js handles the API call
      const result = await registerUser(userData);
      
      // authController.js sends back { msg: "..." }
      alert(result.msg || "Registered Successfully!");
      navigate("/login");
    
    } catch (err) {
      // axiosConfig interceptor rejects with error
      // The backend (authController) sends { msg: "..." } on failure
      const errorMsg = err.response?.data?.msg || "Registration Failed!";
      setErrors({ api: errorMsg }); // You can show this error on the form
      alert(errorMsg); // Show the error from the backend
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(to bottom right, #E3F2FD, #BBDEFB)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          borderRadius: 4,
          width: "100%",
          maxWidth: 450,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" color="primary" mb={3}>
          Create Account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            variant="outlined"
            margin="normal"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />

          {/* ✅ ADDED: Company Name Field */}
          <TextField
            fullWidth
            label="Company Name"
            name="companyName"
            variant="outlined"
            margin="normal"
            value={formData.companyName}
            onChange={handleChange}
            error={!!errors.companyName}
            helperText={errors.companyName}
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email Address"
            name="email"
            variant="outlined"
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />

          {/* Password */}
          <TextField
            fullWidth
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm Password */}
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    edge="end"
                  >
                    {showConfirmPassword ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          {/* API Error Display */}
          {errors.api && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.api}
            </Typography>
          )}

          {/* Submit Button */}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{
              mt: 3,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
            }}
          >
            Register Now ✨
          </Button>

          {/* Login Redirect */}
          <Typography variant="body2" sx={{ mt: 3 }}>
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#1976d2",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;