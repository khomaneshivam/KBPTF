import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Stack,
} from "@mui/material";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: "", msg: "" });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = await loginUser(formData);

    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("userName", result.user?.name || "User");
      setAlert({ type: "success", msg: result.msg || "Login Successful!" });
      setTimeout(() => navigate("/dashboard"), 1000);
    } else {
      setAlert({ type: "error", msg: result.msg || "Login Failed!" });
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        bgcolor: "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 5,
          width: 400,
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="h4"
          textAlign="center"
          fontWeight={700}
          color="primary"
          mb={3}
        >
          Login
        </Typography>

        {alert.msg && (
          <Alert
            severity={alert.type}
            sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setAlert({ type: "", msg: "" })}
          >
            {alert.msg}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Email"
            variant="outlined"
            name="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Password"
            variant="outlined"
            name="password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            sx={{
              mt: 1,
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
            }}
            onClick={handleSubmit}
          >
            Sign In
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ mt: 2, color: "text.secondary" }}
          >
            Don’t have an account?
            <Link
              to="/"
              style={{ color: "#1976d2", marginLeft: 6, textDecoration: "none" }}
            >
              Register
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
