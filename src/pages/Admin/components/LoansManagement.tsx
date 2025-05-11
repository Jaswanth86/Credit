// frontend/src/pages/Admin/components/LoansManagement.tsx
import React, { useState, useMemo } from 'react';
import { Loan, LoanStatus, LoanType } from '../../../types';
import { updateLoanStatus } from '../../../services/api';

interface LoansManagementProps {
  loans: Loan[];
  onStatusChange: () => void;
}

const LoansManagement: React.FC<LoansManagementProps> = ({ loans, onStatusChange }) => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [statusFilter, setStatusFilter] = useState<LoanStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<LoanType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusClass = (status: LoanStatus) => {
    switch (status) {
      case LoanStatus.PENDING:
        return 'status-pending';
      case LoanStatus.VERIFIED:
        return 'status-verified';
      case LoanStatus.APPROVED:
        return 'status-approved';
      case LoanStatus.REJECTED:
        return 'status-rejected';
      default:
        return '';
    }
  };

  const handleViewDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setActionMessage(null);
  };

  const handleCloseDetails = () => {
    setSelectedLoan(null);
  };

  const handleUpdateStatus = async (loanId: string, newStatus: LoanStatus) => {
    try {
      setIsProcessing(true);
      setActionMessage(null);
      
      await updateLoanStatus(loanId, newStatus);
      
      setActionMessage({
        text: `Loan status successfully updated to ${newStatus}`,
        type: 'success'
      });
      
      onStatusChange();
    } catch (err) {
      console.error('Error updating loan status:', err);
      setActionMessage({
        text: 'Failed to update loan status. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      // Apply status filter
      if (statusFilter !== 'ALL' && loan.status !== statusFilter) {
        return false;
      }
      
      // Apply type filter
      if (typeFilter !== 'ALL' && loan.loanType !== typeFilter) {
        return false;
      }
      
      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          loan._id.toLowerCase().includes(query) ||
          loan.fullName.toLowerCase().includes(query) ||
          loan.email.toLowerCase().includes(query) ||
          loan.purpose.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [loans, statusFilter, typeFilter, searchQuery]);

  return (
    <div className="loans-management">
      <h2>Loans Management</h2>
      
      {selectedLoan ? (
        <div className="loan-details-view">
          <div className="details-header">
            <h3>Loan Details</h3>
            <button className="secondary" onClick={handleCloseDetails}>Back to List</button>
          </div>
          
          {actionMessage && (
            <div className={`action-message ${actionMessage.type}`}>
              {actionMessage.text}
            </div>
          )}
          
          <div className="loan-details">
            <div className="loan-details-row">
              <span className="loan-details-label">Loan ID:</span>
              <span className="loan-details-value">{selectedLoan._id}</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Applicant:</span>
              <span className="loan-details-value">{selectedLoan.fullName}</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Contact:</span>
              <span className="loan-details-value">
                {selectedLoan.email} | {selectedLoan.phone}
              </span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Type:</span>
              <span className="loan-details-value">{selectedLoan.loanType.charAt(0).toUpperCase() + selectedLoan.loanType.slice(1)}</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Amount:</span>
              <span className="loan-details-value">{formatCurrency(selectedLoan.amount)}</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Interest Rate:</span>
              <span className="loan-details-value">{selectedLoan.interestRate}%</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Due Date:</span>
              <span className="loan-details-value">{formatDate(selectedLoan.dueDate)}</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Status:</span>
              <span className={`status-badge ${getStatusClass(selectedLoan.status)}`}>
                {selectedLoan.status}
              </span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Purpose:</span>
              <span className="loan-details-value purpose-text">{selectedLoan.purpose}</span>
            </div>
            {selectedLoan.status === LoanStatus.APPROVED && (
              <>
                <div className="loan-details-row">
                  <span className="loan-details-label">Amount Paid:</span>
                  <span className="loan-details-value">{formatCurrency(selectedLoan.amountPaid)}</span>
                </div>
                <div className="loan-details-row">
                  <span className="loan-details-label">Remaining Balance:</span>
                  <span className="loan-details-value">
                    {formatCurrency(selectedLoan.amount + (selectedLoan.amount * selectedLoan.interestRate / 100) - selectedLoan.amountPaid)}
                  </span>
                </div>
              </>
            )}
          </div>
          
          <div className="loan-status-actions">
            <h4>Update Loan Status</h4>
            <div className="status-buttons">
              {selectedLoan.status === LoanStatus.PENDING && (
                <>
                  <button 
                    className="verify-btn" 
                    onClick={() => handleUpdateStatus(selectedLoan._id, LoanStatus.VERIFIED)}
                    disabled={isProcessing}
                  >
                    Verify Loan
                  </button>
                  <button 
                    className="reject-btn" 
                    onClick={() => handleUpdateStatus(selectedLoan._id, LoanStatus.REJECTED)}
                    disabled={isProcessing}
                  >
                    Reject Loan
                  </button>
                </>
              )}
              
              {selectedLoan.status === LoanStatus.VERIFIED && (
                <>
                  <button 
                    className="approve-btn" 
                    onClick={() => handleUpdateStatus(selectedLoan._id, LoanStatus.APPROVED)}
                    disabled={isProcessing}
                  >
                    Approve Loan
                  </button>
                  <button 
                    className="reject-btn" 
                    onClick={() => handleUpdateStatus(selectedLoan._id, LoanStatus.REJECTED)}
                    disabled={isProcessing}
                  >
                    Reject Loan
                  </button>
                </>
              )}
              
              {(selectedLoan.status === LoanStatus.APPROVED || selectedLoan.status === LoanStatus.REJECTED) && (
                <p className="status-final-message">
                  This loan application is in a final state and cannot be modified.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="filter-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by ID, name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-selects">
              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as LoanStatus | 'ALL')}
                >
                  <option value="ALL">All Statuses</option>
                  <option value={LoanStatus.PENDING}>Pending</option>
                  <option value={LoanStatus.VERIFIED}>Verified</option>
                  <option value={LoanStatus.APPROVED}>Approved</option>
                  <option value={LoanStatus.REJECTED}>Rejected</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Loan Type:</label>
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value as LoanType | 'ALL')}
                >
                  <option value="ALL">All Types</option>
                  <option value={LoanType.PERSONAL}>Personal</option>
                  <option value={LoanType.BUSINESS}>Business</option>
                  <option value={LoanType.EDUCATION}>Education</option>
                  <option value={LoanType.MORTGAGE}>Mortgage</option>
                  <option value={LoanType.AUTO}>Auto</option>
                </select>
              </div>
            </div>
          </div>
          
          {filteredLoans.length === 0 ? (
            <div className="no-loans-message">
              <p>No loans match your search criteria.</p>
            </div>
          ) : (
            <table className="loan-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan._id}>
                    <td>{loan._id.slice(-8)}</td>
                    <td>{loan.fullName}</td>
                    <td>{loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}</td>
                    <td>{formatCurrency(loan.amount)}</td>
                    <td>{formatDate(loan.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>
                      <button className="secondary" onClick={() => handleViewDetails(loan)}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default LoansManagement;