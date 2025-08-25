import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
import { Visibility, VisibilityOff, Email, Google } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Login = () => {
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
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
                        minWidth: 340,
                        borderRadius: 4,
                        boxShadow: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.95)',
                    }}
                >
                    <Typography variant="h4" fontWeight="bold" mb={2} color="primary">
                        Login
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
                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                                Login
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
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                sx={{ py: 1.2, fontWeight: 'bold', fontSize: '1rem' }}
                            >
                                Sign in with Google
                            </Button>
                        </motion.div>
                        <Typography
                            variant="body2"
                            sx={{ mt: 2, textAlign: 'center', color: 'text.secondary', cursor: 'pointer' }}
                            onClick={() => navigate('/signup')}
                        >
                            Don't have an account? Sign up
                        </Typography>
                    </Box>
                </Paper>
            </motion.div>
        </Box>
    );
};

export default Login;