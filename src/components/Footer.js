import React from "react";
import { Box, Container, Grid, Typography, Link, IconButton, Divider } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "#f5f5f5ff", color: "#000", pt: 8, pb: 4, mt: 8, px: 18, borderRadius: "30px 20px 0 0" }}>
        <Grid container spacing={6} display={"flex"} justifyContent="space-between">
          {/* Logo + About */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              JantaVoice
            </Typography>
            <Typography variant="body2" color="grey" sx={{ maxWidth: 300 }}>
              JantaVoice is an AI-powered, voice-enabled platform designed to 
              make municipal services more accessible, inclusive, and efficient for citizens. 
              Available 24x7, it allows users to report civic issues, request municipal services, 
              and check the status of their applications using simple voice commands in multiple 
              languages and dialects.
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="/" color="grey" underline="hover">
                Home
              </Link>
              <Link href="/trips" color="grey" underline="hover">
                Reports
              </Link>
              <Link href="/groups" color="grey" underline="hover">
                Services
              </Link>
              <Link href="/profile" color="grey" underline="hover">
                Profile
              </Link>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Resources
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link href="/privacy" color="grey" underline="hover">
                Privacy Policy
              </Link>
              <Link href="/terms" color="grey" underline="hover">
                Terms of Service
              </Link>
              <Link href="/support" color="grey" underline="hover">
                Support
              </Link>
              <Link href="/faq" color="grey" underline="hover">
                FAQ
              </Link>
            </Box>
          </Grid>

          {/* Socials */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Follow Us
            </Typography>
            <Box>
              <IconButton
                href="https://facebook.com"
                target="_blank"
                sx={{ color: "black" }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                href="https://twitter.com"
                target="_blank"
                sx={{ color: "black" }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                href="https://instagram.com"
                target="_blank"
                sx={{ color: "black" }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                href="https://linkedin.com"
                target="_blank"
                sx={{ color: "black" }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
            <Typography variant="body2" color="grey" mt={2}>
              Stay updated with our latest trips, events, and features.
            </Typography>
          </Grid>
        </Grid>

        {/* Divider + Bottom Text */}
        <Divider sx={{ bgcolor: "grey.800", my: 4 }} />
        <Typography variant="body2" color="grey" align="center">
          © {new Date().getFullYear()} BunkMate. All rights reserved.
        </Typography>
    </Box>
  );
};

export default Footer;
