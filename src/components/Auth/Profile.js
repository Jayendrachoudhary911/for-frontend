import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Edit, Save, Email, Person, PhoneAndroid } from "@mui/icons-material";
import { motion } from "framer-motion";
import Navbar from '../Navbar';
import Footer from '../Footer';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch user profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (err) {
        setError("Failed to load profile.");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [currentUser]);

  // Handle input changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save profile changes
  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const docRef = doc(db, "users", currentUser.uid);
      await updateDoc(docRef, {
        name: profile.name,
        username: profile.username,
        mobile: profile.mobile,
      });
      setSuccess("Profile updated successfully!");
      setEdit(false);
    } catch (err) {
      setError("Failed to update profile.");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Typography color="error">Profile not found.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
      }}
    >

      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            minWidth: 340,
            borderRadius: 4,
            boxShadow: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(255,255,255,0.97)",
          }}
        >
          <Avatar
            src={currentUser.photoURL || undefined}
            sx={{ width: 80, height: 80, mb: 2, bgcolor: "primary.main", fontSize: 36 }}
          >
            {profile.name ? profile.name[0] : ""}
          </Avatar>
          <Typography variant="h5" fontWeight="bold" mb={2} color="primary">
            My Profile
          </Typography>
          {error && (
            <Typography color="error" mb={2}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" mb={2}>
              {success}
            </Typography>
          )}
          <Stack spacing={2} sx={{ width: "100%" }}>
            <TextField
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
                readOnly: !edit,
              }}
            />
            <TextField
              label="Username"
              name="username"
              value={profile.username}
              onChange={handleChange}
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
                readOnly: !edit,
              }}
            />
            <TextField
              label="Email"
              name="email"
              value={profile.email}
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="primary" />
                  </InputAdornment>
                ),
                readOnly: true,
              }}
            />
            <TextField
              label="Mobile Number"
              name="mobile"
              value={profile.mobile}
              onChange={handleChange}
              fullWidth
              margin="dense"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroid color="primary" />
                  </InputAdornment>
                ),
                readOnly: !edit,
              }}
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            {!edit ? (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit />}
                onClick={() => setEdit(true)}
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            )}
            {edit && (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  setEdit(false);
                  setError("");
                  setSuccess("");
                }}
              >
                Cancel
              </Button>
            )}
          </Stack>
        </Paper>
      </motion.div>

      <Footer />
    </Box>
  );
};

export default Profile;