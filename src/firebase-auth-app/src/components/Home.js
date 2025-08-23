import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Home = () => {
    const { currentUser } = useContext(AuthContext);

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            {currentUser ? (
                <p>Hello, {currentUser.email}!</p>
            ) : (
                <p>Please log in to see your content.</p>
            )}
        </div>
    );
};

export default Home;