// frontend/src/pages/Admin/components/AdminStatsOverview.tsx
import React from 'react';
import { AdminStats } from '../../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface AdminStatsOverviewProps {
  stats: AdminStats;
}

const AdminStatsOverview: React.FC<AdminStatsOverviewProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Prepare data for the loans status pie chart
  const loanStatusData = [
    { name: 'Pending', value: stats.loansByStatus.pending, color: '#FFB133' },
    { name: 'Verified', value: stats.loansByStatus.verified, color: '#33A3FF' },
    { name: 'Approved', value: stats.loansByStatus.approved, color: '#4CAF50' },
    { name: 'Rejected', value: stats.loansByStatus.rejected, color: '#F44336' },
  ];

  // Prepare data for the financial chart
  const financialData = [
    { name: 'Disbursed', amount: stats.totalAmountDisbursed },
    { name: 'Collected', amount: stats.totalAmountCollected },
    { name: 'Outstanding', amount: stats.outstandingAmount },
  ];

  return (
    <div className="admin-stats-overview">
      <h2>System Overview</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats.totalUsers}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Active Users</div>
          <div className="stat-value">{stats.activeUsers}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Loans</div>
          <div className="stat-value">{stats.totalLoans}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Default Rate</div>
          <div className="stat-value">{formatPercent(stats.defaultRate)}</div>
        </div>
      </div>

      <div className="financial-stats">
        <div className="chart-container">
          <h3>Financial Overview</h3>
          <div className="financial-metrics">
            <div className="metric">
              <span className="metric-label">Total Disbursed:</span>
              <span className="metric-value">{formatCurrency(stats.totalAmountDisbursed)}</span>
            </div>
            
            <div className="metric">
              <span className="metric-label">Total Collected:</span>
              <span className="metric-value">{formatCurrency(stats.totalAmountCollected)}</span>
            </div>
            
            <div className="metric">
              <span className="metric-label">Outstanding:</span>
              <span className="metric-value">{formatCurrency(stats.outstandingAmount)}</span>
            </div>
          </div>
          
          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="amount" fill="#44a2fc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="chart-container">
          <h3>Loan Status Distribution</h3>
          <div className="loan-status-metrics">
            <div className="status-metric">
              <span className="status-badge status-pending"></span>
              <span className="status-label">Pending: {stats.loansByStatus.pending}</span>
            </div>
            
            <div className="status-metric">
              <span className="status-badge status-verified"></span>
              <span className="status-label">Verified: {stats.loansByStatus.verified}</span>
            </div>
            
            <div className="status-metric">
              <span className="status-badge status-approved"></span>
              <span className="status-label">Approved: {stats.loansByStatus.approved}</span>
            </div>
            
            <div className="status-metric">
              <span className="status-badge status-rejected"></span>
              <span className="status-label">Rejected: {stats.loansByStatus.rejected}</span>
            </div>
          </div>
          
          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsOverview;