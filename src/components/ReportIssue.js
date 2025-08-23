import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ReportIssue = () => {
    const [description, setDescription] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [listening, setListening] = useState(false);
    const navigate = useNavigate();
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    const getRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition is not supported in this browser.');
            return null;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        return recognition;
    };

    const handleMicClick = () => {
        if (listening) {
            recognitionRef.current && recognitionRef.current.stop();
            setListening(false);
            return;
        }
        const recognition = getRecognition();
        if (!recognition) return;
        recognitionRef.current = recognition;
        setError('');
        setListening(true);

        recognition.onstart = () => {
            setListening(true);
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setDescription((prev) => prev ? prev + ' ' + transcript : transcript);
        };
        recognition.onerror = (event) => {
            setError('Voice input error: ' + event.error);
            setListening(false);
        };
        recognition.onend = () => {
            setListening(false);
        };
        recognition.start();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!description.trim()) {
            setError('Please enter a description.');
            setSuccess('');
            return;
        }
        // Here you would send the issue to Firestore
        setSuccess('Issue reported successfully!');
        setError('');
        setDescription('');
        setTimeout(() => navigate('/'), 1200);
    };

    return (
        <div className="container">
            <h2>Report an Issue</h2>
            <p>
                Click the mic and speak your issue. Your speech will be converted to text using Google’s Speech-to-Text (in supported browsers).
            </p>
            <form onSubmit={handleSubmit}>
                <div style={{ position: 'relative' }}>
                    <label>Description:</label>
                    <textarea
                        className="input"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        required
                    />
                    <button
                        type="button"
                        onClick={handleMicClick}
                        style={{
                            position: 'absolute',
                            right: 8,
                            top: 32,
                            background: listening ? '#ff5252' : '#eee',
                            border: 'none',
                            borderRadius: '50%',
                            width: 36,
                            height: 36,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        title={listening ? "Stop Listening" : "Speak"}
                    >
                        <span role="img" aria-label="mic" style={{ fontSize: 20 }}>
                            {listening ? '🎤' : '🎙️'}
                        </span>
                    </button>
                    {listening && (
                        <span style={{
                            position: 'absolute',
                            right: 52,
                            top: 40,
                            color: '#ff5252',
                            fontWeight: 'bold'
                        }}>
                            Listening...
                        </span>
                    )}
                </div>
                <button className="button button-primary" type="submit" style={{ marginTop: 16 }}>
                    Submit Issue
                </button>
            </form>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}
        </div>
    );
};

export default ReportIssue;