// frontend/src/pages/Admin/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { getAdminStats, getAllLoans } from '../../services/api';
import { AdminStats, Loan } from '../../types';
import AdminStatsOverview from './components/AdminStatsOverview';
import LoansManagement from './components/LoansManagement';
import UsersManagement from './components/UsersManagement';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'users'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [statsData, loansData] = await Promise.all([
        getAdminStats(),
        getAllLoans()
      ]);
      
      setStats(statsData);
      setLoans(loansData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLoanStatusChange = () => {
    fetchAdminData();
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={fetchAdminData} className="refresh-btn">
            Refresh Data
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={fetchAdminData}>Try Again</button>
        </div>
      )}

      <div className="dashboard-navigation">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          Loans Management
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Management
        </button>
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      ) : (
        <div className="dashboard-content">
          {activeTab === 'overview' && stats && (
            <AdminStatsOverview stats={stats} />
          )}
          
          {activeTab === 'loans' && (
            <LoansManagement 
              loans={loans} 
              onStatusChange={handleLoanStatusChange} 
            />
          )}
          
          {activeTab === 'users' && (
            <UsersManagement />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
