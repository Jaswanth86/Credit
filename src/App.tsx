import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserDashboard from './pages/User/UserDashboard';
import VerifierDashboard from './pages/Verifier/VerifierDashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<UserDashboard />} />
            <Route path="/verifier" element={<VerifierDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
