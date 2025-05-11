import React from 'react';
import { UserStats } from '../../../types';

interface StatsOverviewProps {
  stats: UserStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="stats-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Borrowed</div>
          <div className="stat-value">{formatCurrency(stats.totalBorrowed)}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">To Be Repaid</div>
          <div className="stat-value">{formatCurrency(stats.totalToRepay)}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Already Paid</div>
          <div className="stat-value">{formatCurrency(stats.totalPaid)}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{formatCurrency(stats.totalOutstanding)}</div>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.loansByStatus.pending}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Verified</div>
          <div className="stat-value">{stats.loansByStatus.verified}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{stats.loansByStatus.approved}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Rejected</div>
          <div className="stat-value">{stats.loansByStatus.rejected}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;