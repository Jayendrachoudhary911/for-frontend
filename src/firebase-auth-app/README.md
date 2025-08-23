# Firebase Authentication App

This project is a React application that implements user authentication using Firebase. It includes login and signup functionality with email/password and Google authentication, session management, and protected routes.

## Project Structure

```
firebase-auth-app
├── public
│   └── index.html          # Main HTML file
├── src
│   ├── components          # Contains all React components
│   │   ├── Auth            # Authentication components
│   │   │   ├── Login.js    # Login component
│   │   │   ├── Signup.js   # Signup component
│   │   │   └── AuthForm.css # Styles for auth forms
│   │   ├── Home.js         # Home component after login
│   │   └── ProtectedRoute.js # Component to protect routes
│   ├── contexts            # Context API for auth state
│   │   └── AuthContext.js  # Auth context provider
│   ├── firebase            # Firebase configuration
│   │   └── config.js       # Firebase config and initialization
│   ├── utils               # Utility functions
│   │   └── session.js      # Session management functions
│   ├── App.js              # Main application component
│   ├── index.js            # Entry point for React app
│   ├── App.css             # Global styles
│   ├── index.css           # Additional styles
│   ├── reportWebVitals.js  # Performance measurement
│   └── setupTests.js       # Testing setup
├── package.json            # NPM configuration
└── README.md               # Project documentation
```

## Features

- **User Authentication**: Users can sign up and log in using email/password or Google authentication.
- **Session Management**: User sessions are managed using local storage to persist authentication state.
- **Protected Routes**: Certain routes are protected and require authentication to access.
- **Responsive Design**: The application is styled to be user-friendly and responsive.

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd firebase-auth-app
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Set up Firebase**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Email/Password and Google authentication in the Firebase Authentication section.
   - Copy your Firebase configuration and replace the contents of `src/firebase/config.js`.

4. **Run the application**:
   ```
   npm start
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000` to view the application.

## Usage

- Users can register for an account or log in using their credentials.
- After logging in, users will be redirected to the home page.
- Protected routes will redirect unauthenticated users to the login page.

## License

This project is licensed under the MIT License.