import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Stack,
  Fade,
} from "@mui/material";
import { Mic, MicOff, Send, RestartAlt, Cancel } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import Navbar from "./Navbar";
import Footer from "./Footer";

// TTS
const speakTTS = (text) => {
  if ("speechSynthesis" in window) {
    const u = new window.SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    window.speechSynthesis.speak(u);
  }
};

export default function RequestService() {
  const [chat, setChat] = useState([
    {
      sender: "system",
      text: "👋 Welcome! Please tell me which service you need.",
    },
  ]);
  const [stage, setStage] = useState("askService"); // askService → askLocation → askDetails → confirm → done
  const [service, setService] = useState("");
  const [details, setDetails] = useState("");
  const [address, setAddress] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [inputActive, setInputActive] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef();

  // Voice Commands
  const commands = [
    {
      command: [
        "reset",
        "restart",
        "start over",
        "cancel",
        "edit service",
        "change service",
        "edit location",
        "change location",
        "edit details",
        "change details",
        "go home",
        "auto location",
        "speak my request",
      ],
      callback: (command) => {
        handleUserMessage(command, "voice-cmd");
      },
      isFuzzyMatch: true,
      fuzzyMatchingThreshold: 0.6,
    },
    {
      command: "*",
      callback: (msg) => {
        if (!inputActive) {
          handleUserMessage(msg, "voice");
        }
      },
    },
  ];

  const {
    transcript,
    finalTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  // Always-on voice unless page is hidden
  useEffect(() => {
    if (
      browserSupportsSpeechRecognition &&
      stage !== "done" &&
      !gettingLocation
    ) {
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    } else {
      SpeechRecognition.abortListening();
    }
    // Pause listening if location being acquired
    return () => SpeechRecognition.abortListening();
    // eslint-disable-next-line
  }, [stage, gettingLocation]);

  // On final transcript, push to "handleUserMessage" if not a command
  useEffect(() => {
    if (
      finalTranscript &&
      finalTranscript.trim().length > 0 &&
      !inputActive &&
      !gettingLocation
    ) {
      handleUserMessage(finalTranscript, "voice");
      resetTranscript();
    }
    // eslint-disable-next-line
  }, [finalTranscript]);

  // Handle Enter in textbox
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && input.trim()) {
      handleUserMessage(input, "typed");
    }
  };

  // Let user always send (any method)
  function handleUserMessage(messageRaw, origin = "typed") {
    const message = messageRaw.trim();
    if (!message) return;
    setChat((prev) => [...prev, { sender: "user", text: message }]);
    setInput("");
    setInputActive(false);
    processMessage(message, origin);
  }

  // Auto location logic (reverse geo)
  async function getAutoLocation() {
    setGettingLocation(true);
    speakTTS("Detecting your location. Please wait.");
    addSystemMessage("Trying to detect your location...");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            let loc = [
              data.address?.road,
              data.address?.neighbourhood,
              data.address?.suburb,
              data.address?.city ||
                data.address?.town ||
                data.address?.village,
              data.address?.state,
              data.address?.country,
              data.address?.postcode,
            ]
              .filter(Boolean)
              .join(", ");
            setAddress(loc || `${latitude}, ${longitude}`);
            setGettingLocation(false);
            setStage("askDetails");
            addSystemMessage(
              `Your address is set to "${loc ||
                `${latitude}, ${longitude}`}". Please describe your request in detail.`
            );
          } catch {
            setGettingLocation(false);
            addSystemMessage(
              `Could not detect address. Please type your location.`
            );
            speakTTS("Could not get address. Type or speak your address.");
          }
        },
        () => {
          setGettingLocation(false);
          addSystemMessage(
            "Location access denied. Please type or speak your address."
          );
          speakTTS("Location access denied. Please provide address.");
        }
      );
    } else {
      setGettingLocation(false);
      addSystemMessage(
        "Geolocation is not supported in this browser. Please provide address."
      );
      speakTTS("Geolocation is not supported. Please provide address.");
    }
  }

  // Conversation/command logic
  async function processMessage(msgRaw, origin = "typed") {
    const msg = msgRaw.trim().toLowerCase();
    // global commands
    if (["reset", "restart", "start over"].includes(msg)) {
      setStage("askService");
      setService("");
      setDetails("");
      setAddress("");
      addSystemMessage("No problem, let's start over. What service do you need?");
      return;
    }
    if (msg === "cancel") {
      setStage("askService");
      setService("");
      setDetails("");
      setAddress("");
      addSystemMessage("Request cancelled. To start again, specify your service.");
      return;
    }
    if (msg === "go home") {
      speakTTS("Redirecting to home.");
      navigate("/");
      return;
    }
    if (["edit service", "change service"].includes(msg)) {
      setStage("askService");
      addSystemMessage("Sure! What service do you want to request?");
      return;
    }
    if (["edit details", "change details"].includes(msg)) {
      setStage("askDetails");
      addSystemMessage("Okay! Please provide new details about your request.");
      return;
    }
    if (["edit location", "change location"].includes(msg)) {
      setStage("askLocation");
      addSystemMessage(
        "What address should I use? Type or speak, or say 'auto location' for automatic detection."
      );
      return;
    }
    if (msg.match(/auto location/)) {
      await getAutoLocation();
      return;
    }
    if (msg === "speak my request") {
      const text =
        service && details && address
          ? `You have requested: ${service}, at: ${address}, details: ${details}`
          : `Provide all service, address and details to get a summary.`;
      speakTTS(text);
      addSystemMessage(text);
      return;
    }

    // Conversation logic
    if (stage === "askService") {
      if (msg.length < 3) {
        addSystemMessage("Please specify the service you need.");
        return;
      }
      setService(msgRaw);
      setStage("askLocation");
      addSystemMessage(
        "Where should this service take place? Type or speak your address, or say 'auto location' for automatic detection."
      );
      return;
    }
    if (stage === "askLocation") {
      if (msg.includes("auto location")) {
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
        `You've requested "${service}" at "${address}" with details: "${msgRaw}". Would you like to submit? (yes or no)`
      );
      return;
    }
    if (stage === "confirm") {
      if (["yes", "submit", "send", "save"].includes(msg)) {
        setStage("submitting");
        await submitRequest();
      } else if (["no", "cancel"].includes(msg)) {
        setStage("askService");
        setService("");
        setDetails("");
        setAddress("");
        addSystemMessage("Request not submitted. Let's start over. What service do you need?");
      } else {
        addSystemMessage("Say 'yes' to submit, 'no' to cancel, or 'edit service', 'edit details', 'edit location'.");
      }
      return;
    }
  }

  // System TTS msg
  function addSystemMessage(text) {
    setChat((prev) => [...prev, { sender: "system", text }]);
    speakTTS(text);
  }

  // Submit API
  async function submitRequest() {
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
        addSystemMessage("✅ Service requested successfully! Redirecting you...");
        setStage("done");
        setTimeout(() => navigate("/"), 2000);
      } else {
        addSystemMessage("❌ Failed to request service. Try again or say 'restart'.");
        setStage("askService");
      }
    } catch {
      addSystemMessage("⚠️ Server error. Please try again later.");
      setStage("askService");
    }
  }


  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 10, pb: 6 }}>
        <Typography variant="h5" gutterBottom>
          Voice & Chat Service Request
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
            bgcolor: "#f7f7fa",
          }}
        >
          {chat.map((msg, i) => (
            <Fade in key={i}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  mb: 1,
                }}
              >
                <Box
                  sx={{
                    bgcolor:
                      msg.sender === "user"
                        ? "primary.main"
                        : "grey.100",
                    color: msg.sender === "user" ? "white" : "black",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    maxWidth: "80%",
                    fontSize: 16,
                    boxShadow:
                      msg.sender === "user"
                        ? 2
                        : undefined,
                  }}
                >
                  {msg.text}
                </Box>
              </Box>
            </Fade>
          ))}
          {gettingLocation && (
            <Box sx={{ my: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Detecting your location...
              </Typography>
            </Box>
          )}
        </Paper>


        {/* ---------- Listening Indicator ---------- */}
        {listening && !gettingLocation && (
          <Box
            sx={{
              mb: 1,
              display: "flex",
              alignItems: "center",
              color: "primary.main",
              fontWeight: "bold",
              fontSize: 14,
            }}
            aria-live="polite"
            role="alert"
          >
            🎙️ Listening...
          </Box>
        )}

        {/* Chatbar */}
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            inputRef={inputRef}
            placeholder={
              listening
                ? transcript && !inputActive
                  ? transcript
                  : "Type or say something…"
                : "Type or say something…"
            }
            value={inputActive ? input : ""}
            onFocus={() => setInputActive(true)}
            onBlur={() => setInputActive(false)}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={stage === "submitting" || stage === "done" || gettingLocation}
            InputProps={{
              style: { fontSize: 16 },
              endAdornment: (
                <Fade in={browserSupportsSpeechRecognition}>
                  <Box>
                    <IconButton
                      color={listening ? "error" : "primary"}
                      disabled={gettingLocation || !browserSupportsSpeechRecognition}
                      tabIndex={-1}
                      onClick={() =>
                        listening
                          ? SpeechRecognition.stopListening()
                          : SpeechRecognition.startListening({ continuous: true, language: "en-US" })
                      }
                      title={listening ? "Stop Listening" : "Start Listening"}
                    >
                      {listening ? <MicOff /> : <Mic />}
                    </IconButton>
                  </Box>
                </Fade>
              ),
            }}
          />
          <IconButton
            color="primary"
            onClick={() => handleUserMessage(input, "typed")}
            disabled={
              !input.trim() ||
              stage === "submitting" ||
              stage === "done" ||
              gettingLocation
            }
            title="Send"
            sx={{ fontSize: 22 }}
          >
            <Send />
          </IconButton>
          <IconButton
            color="secondary"
            onClick={() => handleUserMessage("reset")}
            disabled={stage === "submitting" || stage === "done" || gettingLocation}
            title="Restart"
          >
            <RestartAlt />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => handleUserMessage("cancel")}
            disabled={stage === "submitting" || stage === "done" || gettingLocation}
            title="Cancel"
          >
            <Cancel />
          </IconButton>
        </Stack>
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 1 }}
        >
          Voice always on: Just speak naturally anytime (say "yes", "auto location", "edit details", etc)
        </Typography>
      </Container>
      <Footer />
    </>
  );
}

