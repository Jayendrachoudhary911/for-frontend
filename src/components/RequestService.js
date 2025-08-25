import React, { useState, useRef } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Stack,
} from "@mui/material";
import { Mic, MicOff, Send, RestartAlt, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import Navbar from "./Navbar";
import Footer from "./Footer";

const speakTTS = (text) => {
  if ("speechSynthesis" in window) {
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }
};

const RequestService = () => {
  const [chat, setChat] = useState([
    { sender: "system", text: "👋 Welcome! Please tell me which service you need." },
  ]);
  const [stage, setStage] = useState("askService"); // askService → askLocation → askDetails → confirm → done
  const [service, setService] = useState("");
  const [details, setDetails] = useState("");
  const [address, setAddress] = useState("");
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  // --- Speech Recognition ---
  const getRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported.");
      speakTTS("Speech recognition not supported.");
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
      handleUserMessage(transcript, true);
    };

    recognition.onerror = (event) => {
      setError("Voice input error: " + event.error);
      speakTTS("Voice input error: " + event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.start();
  };

  // --- Chat/Command Handler ---
  const handleUserMessage = (message, isVoice = false) => {
    if (!message.trim()) return;
    setChat((prev) => [...prev, { sender: "user", text: message }]);
    setInput("");
    processMessage(message, isVoice);
  };

  // --- Use geolocation for address ---
  const getAutoLocation = async () => {
    setGettingLocation(true);
    speakTTS("Detecting your location. Please wait.");
    addSystemMessage("Trying to detect your location...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // Use OpenStreetMap's Nominatim for reverse geocoding
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            let loc = "";
            if (data.address) {
              loc = [
                data.address.road || "",
                data.address.neighbourhood || "",
                data.address.suburb || "",
                data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  "",
                data.address.state || "",
                data.address.country || "",
                data.address.postcode || "",
              ]
                .filter(Boolean)
                .join(", ");
            }
            setAddress(loc || `${latitude}, ${longitude}`);
            setGettingLocation(false);
            setStage("askDetails");
            addSystemMessage(
              `Your address has been set to "${loc ||
                `${latitude}, ${longitude}`}". Please describe your request in detail.`
            );
          } catch (err) {
            setGettingLocation(false);
            addSystemMessage(
              `Unable to auto-detect address, please type your location.`
            );
            speakTTS("Could not get address automatically. Enter address manually.");
          }
        },
        () => {
          setGettingLocation(false);
          addSystemMessage(
            "Location access denied. Please type your address."
          );
          speakTTS("Location access denied. Please type your address.");
        }
      );
    } else {
      setGettingLocation(false);
      addSystemMessage(
        "Geolocation is not supported in this browser. Please type your address."
      );
      speakTTS("Geolocation is not supported in this browser. Please type your address.");
    }
  };

  // --- Conversation/Command Handler ---
  const processMessage = async (msgRaw, isVoice = false) => {
    const msg = msgRaw.trim().toLowerCase();

    // Global voice commands
    if (msg.includes("reset") || msg.includes("restart") || msg.includes("start over")) {
      setStage("askService");
      setService("");
      setDetails("");
      setAddress("");
      addSystemMessage("No problem, let's start over. What service do you need?");
      return;
    }
    if (msg.includes("cancel")) {
      setStage("askService");
      setService("");
      setDetails("");
      setAddress("");
      addSystemMessage("Request cancelled. If you want to start again, specify your service.");
      return;
    }
    if (msg.includes("go home")) {
      speakTTS("Redirecting to home.");
      navigate("/");
      return;
    }
    if (msg.includes("edit service") || msg.includes("change service")) {
      setStage("askService");
      addSystemMessage("Sure! What service do you want to request?");
      return;
    }
    if (msg.includes("edit details") || msg.includes("change details")) {
      setStage("askDetails");
      addSystemMessage("Okay! Please provide new details about your request.");
      return;
    }
    if (msg.includes("edit location") || msg.includes("change location")) {
      setStage("askLocation");
      addSystemMessage(
        "What address should I use? Type or speak, or say 'auto location' for automatic detection."
      );
      return;
    }
    if (msg.includes("speak my request") || msg.includes("say my request")) {
      const text =
        service && details && address
          ? `You have requested: ${service}, at: ${address}, with details: ${details}`
          : `Provide all service, address and details to get a summary.`;
      speakTTS(text);
      addSystemMessage(text);
      return;
    }

    // --- Main Conversation flow ---
    if (stage === "askService") {
      if (msg.length < 3) {
        addSystemMessage("Please specify the service you need.");
        return;
      }
      setService(msgRaw);
      setStage("askLocation");
      addSystemMessage(
        "Where should this service take place? Type your address or say 'auto location' for automatic detection."
      );
      return;
    }

    if (stage === "askLocation") {
      if (msg.includes("auto location") || msg.includes("auto-address")) {
        await getAutoLocation();
        return;
      }
      if (msg.length < 3) {
        addSystemMessage("Please specify a valid address, or say 'auto location'.");
        return;
      }
      setAddress(msgRaw);
      setStage("askDetails");
      addSystemMessage("Address received. Please describe your request in detail.");
      return;
    }

    if (stage === "askDetails") {
      if (msg.length < 3) {
        addSystemMessage("Please provide more details for your service request.");
        return;
      }
      setDetails(msgRaw);
      setStage("confirm");
      addSystemMessage(
        `You've requested "${service}" at "${address}" with details: "${msgRaw}". Would you like to submit? (yes/no)`
      );
      return;
    }

    if (stage === "confirm") {
      if (/^(yes|submit|send|save)$/i.test(msg)) {
        setStage("submitting");
        await submitRequest();
      } else if (/^(no|cancel)$/i.test(msg)) {
        setStage("askService");
        setService("");
        setDetails("");
        setAddress("");
        addSystemMessage("Request not submitted. Let's start over. What service do you need?");
      } else {
        addSystemMessage(
          "Please respond with 'yes' to submit, or 'no' to cancel. You may also say 'edit service', 'edit details', or 'edit location'."
        );
      }
      return;
    }
  };

  // --- Add system message and speak ---
  const addSystemMessage = (text) => {
    setChat((prev) => [...prev, { sender: "system", text }]);
    speakTTS(text);
  };

  // --- Submit Request to API ---
  const submitRequest = async () => {
    addSystemMessage("Submitting your request, please wait...");
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const email = user ? user.email : "anonymous@example.com";
      const response = await fetch("http://localhost:5000/api/request-service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          serviceName: service,
          details,
          address,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        addSystemMessage("✅ Service requested successfully! Redirecting you to home...");
        setStage("done");
        setTimeout(() => navigate("/"), 2000);
      } else {
        addSystemMessage("❌ Failed to request service. Try again or say 'restart'.");
        setStage("askService");
      }
    } catch (err) {
      console.error(err);
      addSystemMessage("⚠️ Server error. Please try again later.");
      setStage("askService");
    }
  };

  // --- Render ---
  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 12, pb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Service Request Chat (with Voice Commands)
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          <b>Commands:</b> submit, save, send, reset, restart, cancel, go home, edit service, edit details, edit location, auto location, speak my request, yes, no.
        </Typography>

        <Paper
          variant="outlined"
          sx={{
            height: 400,
            p: 2,
            mb: 2,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {chat.map((msg, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 1,
              }}
            >
              <Box
                sx={{
                  bgcolor: msg.sender === "user" ? "primary.main" : "grey.300",
                  color: msg.sender === "user" ? "white" : "black",
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: "75%",
                }}
              >
                {msg.text}
              </Box>
            </Box>
          ))}
          {gettingLocation && (
            <Box sx={{ my: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Detecting your location...
              </Typography>
            </Box>
          )}
        </Paper>

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            placeholder="Type or speak here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && input.trim() && handleUserMessage(input)
            }
            disabled={stage === "submitting" || stage === "done" || gettingLocation}
          />
          <IconButton
            color={listening ? "error" : "primary"}
            onClick={handleMicClick}
            disabled={stage === "submitting" || stage === "done" || gettingLocation}
            title={listening ? "Stop Listening" : "Speak"}
          >
            {listening ? <MicOff /> : <Mic />}
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => handleUserMessage(input)}
            disabled={!input.trim() || stage === "submitting" || stage === "done" || gettingLocation}
            title="Send"
          >
            <Send />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleUserMessage("reset")}
            title="Restart"
            disabled={stage === "submitting" || stage === "done" || gettingLocation}
          >
            <RestartAlt />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleUserMessage("cancel")}
            title="Cancel"
            disabled={stage === "submitting" || stage === "done" || gettingLocation}
          >
            <Cancel />
          </IconButton>
        </Stack>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default RequestService;
