import React, { useState, useRef, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Chip,
  IconButton,
  Alert,
  Stack,
} from "@mui/material";
import { Mic, MicOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Navbar from "./Navbar";
import Footer from "./Footer";
import emailjs from "@emailjs/browser";

// ---------------- Utility: Extract City/State ----------------
const extractLocation = (text, states, citiesMap) => {
  const desc = text.toLowerCase();
  const foundState = states.find((state) => desc.includes(state.toLowerCase()));
  if (foundState) return foundState;
  for (const [state, cities] of Object.entries(citiesMap)) {
    const foundCity = cities.find((city) =>
      desc.includes(city.toLowerCase())
    );
    if (foundCity) return `${foundCity}, ${state}`;
  }
  return "Not Provided";
};

// ---------------- Text-to-Speech ----------------
const speakTTS = (text) => {
  if ("speechSynthesis" in window) {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }
};

const ReportIssue = () => {
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [states, setStates] = useState([]);
  const [citiesMap, setCitiesMap] = useState({});
  const [chat, setChat] = useState([
    { sender: "system", text: "Welcome! Please describe your issue below." },
  ]);
  const [locationMode, setLocationMode] = useState("auto");
  const [manualLocation, setManualLocation] = useState("");
  const [autoLocation, setAutoLocation] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  // ---------------- Fetch States & Cities ----------------
  useEffect(() => {
    const fetchStatesAndCities = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/states");
        const data = await res.json();
        if (data.status === "success") {
          setStates(data.states);
          let citiesData = {};
          for (let state of data.states) {
            const cityRes = await fetch(
              `http://localhost:5000/api/cities?state=${encodeURIComponent(
                state
              )}`
            );
            const cityData = await cityRes.json();
            if (cityData.status === "success") {
              citiesData[state] = cityData.cities;
            }
          }
          setCitiesMap(citiesData);
        }
      } catch (err) {
        console.error("Error fetching states/cities:", err);
      }
    };
    fetchStatesAndCities();
  }, []);

  // ---------------- Auto Geolocation ----------------
  useEffect(() => {
    if (locationMode === "auto") {
      setGettingLocation(true);
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await res.json();
              let loc = "";
              if (data.address) {
                loc = [
                  data.address.city ||
                    data.address.town ||
                    data.address.village ||
                    "",
                  data.address.state || "",
                  data.address.country || "",
                ]
                  .filter(Boolean)
                  .join(", ");
              }
              setAutoLocation(loc || `${latitude}, ${longitude}`);
            } catch {
              setAutoLocation(`${latitude}, ${longitude}`);
            }
            setGettingLocation(false);
          },
          () => {
            setAutoLocation("");
            setGettingLocation(false);
            setError("Could not get your location.");
          }
        );
      } else {
        setAutoLocation("");
        setGettingLocation(false);
        setError("Geolocation not supported in this browser.");
      }
    }
  }, [locationMode]);

  // ---------------- Commands ----------------
  const handleVoiceCommand = (transcript) => {
    const command = transcript.toLowerCase();
    if (command.includes("clear") || command.includes("reset")) {
      setDescription("");
      setChat((prev) => [...prev, { sender: "system", text: "Description cleared." }]);
      speakTTS("Description cleared.");
      return true;
    }
    if (command.includes("submit") || command.includes("send")) {
      speakTTS("Submitting your issue.");
      document.getElementById("report-issue-form")?.requestSubmit();
      return true;
    }
    if (command.includes("go home") || command.includes("back to home")) {
      speakTTS("Going to home page.");
      navigate("/");
      return true;
    }
    if (command.includes("manual location")) {
      setLocationMode("manual");
      speakTTS("Switched to manual location entry.");
      return true;
    }
    if (command.includes("auto location")) {
      setLocationMode("auto");
      speakTTS("Switched to automatic location detection.");
      return true;
    }
    return false;
  };

  // ---------------- Speech Recognition ----------------
  const getRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      speakTTS("Speech recognition not supported in this browser.");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    return recognition;
  };

  const handleMicClick = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = getRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;
    setError("");
    setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (handleVoiceCommand(transcript)) return;
      setDescription((prev) => (prev ? prev + " " + transcript : transcript));
      setChat((prev) => [...prev, { sender: "user", text: transcript }]);
      speakTTS(`You said: ${transcript}`);
    };

    recognition.onerror = (event) => {
      setError("Voice input error: " + event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    const extractedLocation = extractLocation(description, states, citiesMap);
    const finalLocation =
      locationMode === "manual"
        ? manualLocation.trim() || extractedLocation
        : autoLocation || extractedLocation;

    const auth = getAuth();
    if (typeof auth.authStateReady === "function") {
      await auth.authStateReady();
    }
    const user = auth.currentUser;
    const email = user ? user.email : "anonymous@example.com";
    const userName = user?.displayName || email.split("@")[0];

    setChat((prev) => [...prev, { sender: "user", text: description }]);
    speakTTS("Submitting your issue...");

    try {
      const response = await fetch("http://localhost:5000/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          description,
          location: finalLocation,
          address: finalLocation,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setSuccess(
          `Issue reported! Category: ${data.data.complaintType}, Location: ${data.data.address}`
        );
        setError("");
        setDescription("");
        setManualLocation("");
        setChat((prev) => [...prev, { sender: "system", text: "Issue reported successfully!" }]);
        speakTTS("Issue reported successfully! Redirecting...");

        emailjs.send(
          "service_ioqtmrc",
          "template_l1bbc4h",
          {
            to_email: email,
            user_name: userName,
            issue_description: description,
            issue_location: finalLocation,
            complaint_type: data.data.complaintType,
          },
          "XEf3bS7sG7oGPObik"
        );

        setTimeout(() => navigate("/"), 1500);
      } else {
        setError("Failed to report issue. Try again.");
      }
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  // ---------------- UI ----------------
  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ mt: 12, mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Report an Issue
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          You can describe your issue or use voice commands like{" "}
          <b>"clear"</b>, <b>"submit"</b>, <b>"go home"</b>,{" "}
          <b>"manual location"</b>, or <b>"auto location"</b>.
        </Typography>

        {/* Chat Area */}
        <Paper
          variant="outlined"
          sx={{ p: 2, mb: 3, maxHeight: 200, overflowY: "auto" }}
        >
          {chat.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Chip
                label={msg.text}
                color={msg.sender === "user" ? "success" : "default"}
                sx={{ maxWidth: "70%" }}
              />
            </Box>
          ))}
        </Paper>

        {/* Form */}
        <Box component="form" id="report-issue-form" onSubmit={handleSubmit}>
          <Typography variant="subtitle1">Location Mode</Typography>
          <RadioGroup
            row
            value={locationMode}
            onChange={(e) => setLocationMode(e.target.value)}
            sx={{ mb: 2 }}
          >
            <FormControlLabel value="auto" control={<Radio />} label="Auto" />
            <FormControlLabel value="manual" control={<Radio />} label="Manual" />
          </RadioGroup>

          {locationMode === "manual" ? (
            <TextField
              label="Enter Location"
              fullWidth
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              sx={{ mb: 2 }}
            />
          ) : (
            <TextField
              label="Auto Location"
              fullWidth
              value={gettingLocation ? "Detecting location..." : autoLocation}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          {/* Mic Button now outside */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <IconButton
              color={listening ? "error" : "primary"}
              onClick={handleMicClick}
            >
              {listening ? <MicOff /> : <Mic />}
            </IconButton>
            {listening && (
              <Typography color="error" fontWeight="bold">
                Listening...
              </Typography>
            )}
          </Stack>

          <Button type="submit" variant="contained" color="primary">
            Submit Issue
          </Button>
        </Box>

        {/* Alerts */}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Container>
      <Footer />
    </>
  );
};

export default ReportIssue;
