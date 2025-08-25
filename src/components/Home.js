import React from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Container,
  Paper,
  Card,
  CardContent,
  Stack,
  useScrollTrigger,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import BuildIcon from "@mui/icons-material/Build";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PersonIcon from "@mui/icons-material/Person";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmojiTransportationIcon from "@mui/icons-material/EmojiTransportation";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import MicIcon from "@mui/icons-material/Mic";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Contactus from "./Contactus";
import { motion } from "framer-motion";
import { Typewriter } from "react-simple-typewriter";

const features = [
  {
    icon: <MicIcon color="primary" fontSize="large" />,
    title: "Voice Assistant",
    desc: "Interact with city services using your voice.",
  },
  {
    icon: <AssignmentTurnedInIcon color="primary" fontSize="large" />,
    title: "Easy Issue Reporting",
    desc: "Report civic issues in seconds.",
  },
  {
    icon: <BuildIcon color="primary" fontSize="large" />,
    title: "Service Requests",
    desc: "Request municipal services quickly.",
  },
  {
    icon: <ContactMailIcon color="primary" fontSize="large" />,
    title: "Direct Contact",
    desc: "Reach out to your municipality anytime.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const scrolled = useScrollTrigger({ threshold: 10 });

  return (
    <Box sx={{ bgcolor: "#ffffffff" }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: "70vh",
          background:
            "linear-gradient(to bottom, #43a04720 0%, #43a04720 50%, #43a04720 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 8,
          px: 3,
          mx: 4,
          mt: 12,
          borderRadius: 5,
          textAlign: "center",
        }}
      >
        {/* Typing Effect */}
        <Typography
          variant="h3"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "#000", mb: 2 }}
        >
          <Typewriter
            words={[
              "Welcome to JantaVoice!",
              "Your Smart Civic Companion.",
              "Report. Request. Resolve.",
            ]}
            loop={true}
            cursor
            cursorStyle="_"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={2000}
          />
        </Typography>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography
            variant="subtitle1"
            color="#333"
            gutterBottom
            width={{ xs: "90%", md: "550px" }}
            textAlign={"center"}
          >
            An AI-powered, voice-enabled platform designed to make municipal
            services more accessible, inclusive, and efficient. Available 24x7
            to help you report issues, request services, and track progress
            easily.
          </Typography>
        </motion.div>

        <Stack direction="row" spacing={2} sx={{ mt: 5 }}>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="contained"
              onClick={() => navigate("/report-issue")}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1.1rem",
                borderRadius: 3,
                backgroundColor: "#000",
                color: "#fff",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: "#fff",
                  color: "#000",
                  boxShadow: "none",
                },
              }}
            >
              Report an Issue
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/request-service")}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1.1rem",
                borderRadius: 3,
                color: "#000",
                border: "1.2px solid #000",
                transition: "all 0.2s",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#000",
                  color: "#fff",
                },
              }}
            >
              Request a Service
            </Button>
          </motion.div>
        </Stack>
      </Box>

      {/* Quick Tiles Section */}
<Container sx={{ py: 6, backgroundColor: "#fff" }}>
  <Grid container spacing={4} justifyContent="center">
    {[
      {
        icon: <AssignmentTurnedInIcon color="primary" fontSize="large" />,
        title: "View Application Status",
        desc: "Track your requests and complaints.",
        action: () => navigate("/status"),
        btnText: "View Status",
      },
      {
        icon: <ContactMailIcon color="primary" fontSize="large" />,
        title: "Contact Us",
        desc: "Get in touch with your municipality.",
        action: () => {
          const section = document.getElementById("contact");
          if (section) section.scrollIntoView({ behavior: "smooth" });
        },
        btnText: "Contact Now",
      },
      {
        icon: <BuildIcon color="primary" fontSize="large" />,
        title: "Services",
        desc: "Explore all available city services.",
        action: () => navigate("/services"),
        btnText: "Request a Service",
      },
    ].map((tile) => (
      <Grid item xs={12} sm={6} md={4} key={tile.title}>
        <motion.div
          whileHover={{ scale: 1.05, y: -5 }}
          transition={{ type: "spring", stiffness: 250 }}
        >
          <Paper
            elevation={4}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 5,
              minHeight: 210,
              transition: "0.3s",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#eeeeeeff" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              {tile.icon}
            </Box>
            <Typography variant="h6" fontWeight="bold" color="primary.dark" gutterBottom>
              {tile.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tile.desc}
            </Typography>
            <Button
              variant="outlined"
              onClick={tile.action}
              sx={{
                px: 2,
                mt: 3,
                py: 1,
                fontWeight: "bold",
                fontSize: "0.95rem",
                borderRadius: 3,
                color: "#000",
                border: "1.2px solid #000",
                "&:hover": { backgroundColor: "#000", color: "#fff" },
              }}
            >
              {tile.btnText}
            </Button>
          </Paper>
        </motion.div>
      </Grid>
    ))}
  </Grid>
</Container>

      {/* About Section */}
    <Box sx={{ bgcolor: "#fff", py: 8,  height:`90vh`, display:`flex`, alignItems:`center` }}>
      <Container>
        <Grid container spacing={6} alignItems="flex-start">
          {/* Left Column - Description */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              About Our Platform
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: "550px", mb: 4 }}
            >
              Municipal Voice Assistant is an AI-powered, voice-enabled
              platform designed to make municipal services more accessible,
              inclusive, and efficient for citizens. Available 24x7, it allows
              users to report civic issues, request municipal services, and
              check the status of their applications using simple voice
              commands in multiple languages and dialects.
              <br />
              <br />
              The platform integrates with municipal service portals through
              secure APIs and provides audio feedback, making it especially
              useful for senior citizens, differently-abled users, and citizens
              with limited literacy. Each issue or request generates a unique
              request ID for easy tracking, with real-time updates and reminders.
              <br />
              <br />
              If users are not satisfied with the resolution, the platform
              provides an appeal or escalation mechanism to ensure
              accountability and transparency.
            </Typography>
          </Grid>

          {/* Right Column - Services */}
          <Grid item xs={12} md={6} maxWidth={"550px"}>
            <Grid container spacing={1}>
              {[
                {
                  title: "Garbage & Sanitation",
                  icon: <BuildIcon fontSize="large" color="primary" />,
                },
                {
                  title: "Water Supply & Drainage",
                  icon: <WaterDropIcon fontSize="large" color="primary" />,
                },
                {
                  title: "Streetlight Maintenance",
                  icon: <LightbulbIcon fontSize="large" color="primary" />,
                },
                {
                  title: "Road Repair & Potholes",
                  icon: (
                    <EmojiTransportationIcon
                      fontSize="large"
                      color="primary"
                    />
                  ),
                },
                {
                  title: "Property Tax Queries",
                  icon: <AccountBalanceIcon fontSize="large" color="primary" />,
                },
                {
                  title: "Track Your Requests",
                  icon: <PersonIcon fontSize="large" color="primary" />,
                },
              ].map((service, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card
                    elevation={1}
                    sx={{
                      borderRadius: 3,
                      height: "100%",
                      width: "177px",
                      transition: "0.3s",
                      backgroundColor: "#f4f4f4ff",
                      boxShadow: "none",
                      "&:hover": { transform: "translateY(-5px)" },
                    }}
                  >
                    <CardContent
                      sx={{ textAlign: "center", p: 3, minHeight: "150px" }}
                    >
                      {service.icon}
                      <Typography
                        variant="subtitle1"
                        sx={{ mt: 1 }}
                      >
                        {service.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>

      {/* Features Section */}
<Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
  <Container maxWidth="lg">
    {/* Section Title */}
    <Typography
      variant="h4"
      fontWeight="bold"
      align="center"
      gutterBottom
      sx={{
        color: "text.primary",
        letterSpacing: 0.5,
      }}
    >
      Features
    </Typography>
    <Typography
      variant="subtitle1"
      align="center"
      color="text.secondary"
      sx={{ mb: 5 }}
    >
      Explore the powerful tools that make your experience seamless
    </Typography>

    {/* Features Grid */}
    <Grid container spacing={4} justifyContent="center">
      {features.map((f, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 4,
              height: "100%",
              width: "200px",
              transition: "all 0.3s ease",
              boxShadow: "none",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "none",
              },
            }}
          >
            {/* Icon */}
            <Box
              mb={2}
              sx={{
                fontSize: 48,
                color: "primary.main",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {f.icon}
            </Box>

            {/* Title */}
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 1, color: "text.primary" }}
            >
              {f.title}
            </Typography>

            {/* Description */}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {f.desc}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Container>
</Box>

      <Box id={"contact"}>
        <Contactus />
      </Box>

      <Footer />
    </Box>
  );
};

export default Home;
