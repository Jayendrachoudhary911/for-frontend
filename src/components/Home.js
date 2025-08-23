import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Example counts (replace with real data if available)
    const issuesCount = 5;
    const servicesCount = 3;

    if (!currentUser) {
        return <p>Please log in to see your content.</p>;
    }

    return (
        <div className="container">
            <h1>Welcome to the Home Page</h1>
            <div className="profile-section" style={{ marginBottom: 24, padding: 16, border: '1px solid #eee', borderRadius: 8 }}>
                <h2>Profile</h2>
                <p><strong>Email:</strong> {currentUser.email}</p>
                {/* Add more profile info here if available */}
            </div>
            <div className="count-section" style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
                <div>
                    <h3>Issues Reported</h3>
                    <p style={{ fontSize: 24, fontWeight: 'bold' }}>{issuesCount}</p>
                </div>
                <div>
                    <h3>Services Requested</h3>
                    <p style={{ fontSize: 24, fontWeight: 'bold' }}>{servicesCount}</p>
                </div>
            </div>
            <div className="actions" style={{ display: 'flex', gap: 16 }}>
                <button className="button button-primary" onClick={() => navigate('/report-issue')}>
                    Report an Issue
                </button>
                <button className="button button-secondary" onClick={() => navigate('/request-service')}>
                    Request a Service
                </button>
            </div>
        </div>
    );
};

export default Home;