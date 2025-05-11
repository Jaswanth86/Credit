import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1>Loan Manager</h1>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            User Dashboard
          </Link>
        </li>
        <li>
          <Link to="/verifier" className={location.pathname === '/verifier' ? 'active' : ''}>
            Verifier Dashboard
          </Link>
        </li>
        <li>
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            Admin Dashboard
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;