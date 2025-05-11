// frontend/src/layouts/VerifierLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifierLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is authenticated and has verifier role
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'verifier') {
      navigate('/unauthorized');
      return;
    }

    // Fetch pending verification count 
    const fetchPendingCount = async () => {
      try {
        // This would be an API call in a real application
        // const response = await getVerifierStats();
        // setPendingCount(response.pendingVerifications);
        
        // For demo purposes, set a random number
        setPendingCount(Math.floor(Math.random() * 10));
      } catch (err) {
        console.error('Error fetching pending count:', err);
      }
    };

    fetchPendingCount();
    
    // Set up a polling interval to refresh the count
    const intervalId = setInterval(fetchPendingCount, 60000); // every minute
    
    return () => clearInterval(intervalId);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`verifier-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="verifier-header">
        <div className="logo-container">
          <button className="toggle-sidebar" onClick={toggleSidebar}>
            ☰
          </button>
          <h1>Loan System</h1>
        </div>
        
        <div className="user-controls">
          <div className="user-info">
            <span className="user-name">{user?.fullName}</span>
            <span className="user-role">Verifier</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="layout-container">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li>
                <NavLink 
                  to="/verifier/dashboard" 
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/verifier/pending" 
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <span className="nav-icon">🔍</span>
                  <span className="nav-text">Pending Verifications</span>
                  {pendingCount > 0 && (
                    <span className="badge">{pendingCount}</span>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/verifier/history" 
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <span className="nav-icon">📜</span>
                  <span className="nav-text">Verification History</span>
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/verifier/profile" 
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  <span className="nav-icon">👤</span>
                  <span className="nav-text">My Profile</span>
                </NavLink>
              </li>
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <div className="support-link">
              <span className="nav-icon">❓</span>
              <span className="nav-text">Help & Support</span>
            </div>
          </div>
        </aside>
        
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VerifierLayout;