import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Home from './components/Home';
import ReportIssue from './components/ReportIssue';
import RequestService from './components/RequestService';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Auth/Profile';
import Dashboard from './components/Dashboard';
import './App.css';

function AppRoutes() {
  const { currentUser } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser ? <Home /> : <Navigate to="/login" />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/report-issue" element={<ReportIssue />} />
      <Route path="/request-service" element={<RequestService />} />
      <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/status" element={currentUser ? <Dashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;