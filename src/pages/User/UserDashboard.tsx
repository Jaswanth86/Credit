// frontend/src/pages/User/UserDashboard.tsx
import React, { useState, useEffect } from 'react';
import { getUserLoans } from '../../services/api';
import getUserStats from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { UserStats, Loan } from '../../types';
import StatsOverview from './components/StatsOverview';
import LoansList from './components/LoansList';
import LoanApplicationForm from './components/LoanApplicationForm';
import './UserDashboard.css';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showApplicationForm, setShowApplicationForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!user?._id) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const statsResponse = await getUserStats(user._id);
      const loansResponse = await getUserLoans(user._id);
      const stats = statsResponse.data || statsResponse;
      const loansData = loansResponse.data || loansResponse;
      setUserStats(stats);
      setLoans(loansData);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load your loan information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const toggleApplicationForm = () => {
    setShowApplicationForm(!showApplicationForm);
  };

  const handleFormSubmitted = () => {
    setShowApplicationForm(false);
    fetchUserData(); // Refresh data after submission
  };

  if (isLoading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <button onClick={toggleApplicationForm}>
          {showApplicationForm ? 'Cancel Application' : 'Apply for Loan'}
        </button>
      </div>

      {showApplicationForm ? (
        <div className="card">
          <LoanApplicationForm onSubmitted={handleFormSubmitted} />
        </div>
      ) : (
        <>
          {userStats && <StatsOverview stats={userStats} />}

          <div className="card">
            <h2>Your Loan Applications</h2>
            <LoansList loans={loans} />
          </div>
        </>
      )}
    </div>
  );
};

export default UserDashboard;

