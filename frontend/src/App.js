import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SignInForm from './SignInForm';
import RegistrationForm from './RegistrationForm';
import Dashboard from './dashboard';
import AdminDashboard from './admin_dashboard';

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') && localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<SignInForm />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/signup" element={<Navigate to="/register" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
