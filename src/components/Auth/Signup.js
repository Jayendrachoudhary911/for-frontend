import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Google, Person, PhoneAndroid } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Signup = () => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showCnfPassword, setShowCnfPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validate form
  const validate = () => {
    if (!form.name || !form.username || !form.email || !form.password || !form.confirmPassword || !form.mobile) {
      setError('All fields are required.');
      return false;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    if (!/^\d{10}$/.test(form.mobile)) {
      setError('Mobile number must be 10 digits.');
      return false;
    }
    return true;
  };

  // Email/Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: form.name });
      // Store user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: form.name,
        username: form.username,
        email: form.email,
        mobile: form.mobile,
        provider: 'email',
        createdAt: new Date(),
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Try to get name, email, phone from Google profile
      const name = user.displayName || '';
      const email = user.email || '';
      const mobile = user.phoneNumber ? user.phoneNumber.replace(/\D/g, '').slice(-10) : '';
      // Prompt for username if not present (simple prompt, can be improved)
      let username = user.email ? user.email.split('@')[0] : '';
      if (!username) username = prompt('Enter a username:');
      // Store user info in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        username,
        email,
        mobile,
        provider: 'google',
        createdAt: new Date(),
      });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            maxWidth: 340,
            borderRadius: 4,
            boxShadow: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.95)',
          }}
        >
          <Typography variant="h4" fontWeight="bold" mb={2} color="primary">
            Sign Up
          </Typography>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography color="error" mb={2}>
                {error}
              </Typography>
            </motion.div>
          )}
          <Box component="form" onSubmit={handleSignup} sx={{ width: '100%' }}>
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroid color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type={showCnfPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowCnfPassword((show) => !show)}
                      edge="end"
                      aria-label="toggle confirm password visibility"
                    >
                      {showCnfPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%' }}
            >
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2, py: 1.2, fontWeight: 'bold', fontSize: '1rem' }}
                disabled={loading}
              >
                Sign Up
              </Button>
            </motion.div>
            <Divider sx={{ my: 2 }}>or</Divider>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%' }}
            >
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                startIcon={<Google />}
                onClick={handleGoogleSignup}
                disabled={loading}
                sx={{ py: 1.2, fontWeight: 'bold', fontSize: '1rem' }}
              >
                Sign up with Google
              </Button>
            </motion.div>
            <Typography
              variant="body2"
              sx={{ mt: 2, textAlign: 'center', color: 'text.secondary', cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              Already have an account? Login
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Signup;