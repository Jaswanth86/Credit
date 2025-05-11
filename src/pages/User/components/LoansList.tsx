import React, { useState } from 'react';
import { Loan, LoanStatus } from '../../../types';

interface LoansListProps {
  loans: Loan[];
}

const LoansList: React.FC<LoansListProps> = ({ loans }) => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

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
  };

  const handleCloseDetails = () => {
    setSelectedLoan(null);
  };

  if (loans.length === 0) {
    return <p>You haven't applied for any loans yet.</p>;
  }

  return (
    <div className="loans-list">
      {selectedLoan ? (
        <div className="loan-details-view">
          <div className="details-header">
            <h3>Loan Details</h3>
            <button className="secondary" onClick={handleCloseDetails}>Back to List</button>
          </div>
          
          <div className="loan-details">
            <div className="loan-details-row">
              <span className="loan-details-label">Loan ID:</span>
              <span className="loan-details-value">{selectedLoan._id}</span>
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
              <span className="loan-details-label">Status:</span>
              <span className={`status-badge ${getStatusClass(selectedLoan.status)}`}>
                {selectedLoan.status}
              </span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Purpose:</span>
              <span className="loan-details-value">{selectedLoan.purpose}</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Application Date:</span>
              <span className="loan-details-value">{formatDate(selectedLoan.createdAt)}</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Due Date:</span>
              <span className="loan-details-value">{formatDate(selectedLoan.dueDate)}</span>
            </div>
            <div className="loan-details-row">
              <span className="loan-details-label">Interest Rate:</span>
              <span className="loan-details-value">{selectedLoan.interestRate}%</span>
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
          
          <div className="loan-status-timeline">
            <h4>Loan Timeline</h4>
            
            <div className="timeline-item">
              <div className="timeline-connector"></div>
              <div className="timeline-content">
                <h5>Application Submitted</h5>
                <p className="timeline-date">{formatDate(selectedLoan.createdAt)}</p>
              </div>
            </div>
            
            {selectedLoan.verifiedAt && (
              <div className="timeline-item">
                <div className="timeline-connector"></div>
                <div className="timeline-content">
                  <h5>Loan Verified</h5>
                  <p className="timeline-date">{formatDate(selectedLoan.verifiedAt)}</p>
                </div>
              </div>
            )}
            
            {selectedLoan.approvedAt && (
              <div className="timeline-item">
                <div className="timeline-connector"></div>
                <div className="timeline-content">
                  <h5>Loan Approved</h5>
                  <p className="timeline-date">{formatDate(selectedLoan.approvedAt)}</p>
                </div>
              </div>
            )}
            
            {selectedLoan.status === LoanStatus.REJECTED && (
              <div className="timeline-item">
                <div className="timeline-connector"></div>
                <div className="timeline-content">
                  <h5>Loan Rejected</h5>
                  <p className="timeline-date">{formatDate(selectedLoan.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <table className="loan-table">
          <thead>
            <tr>
              <th>Loan Type</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan._id}>
                <td>{loan.loanType.charAt(0).toUpperCase() + loan.loanType.slice(1)}</td>
                <td>{formatCurrency(loan.amount)}</td>
                <td>{formatDate(loan.createdAt)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(loan.status)}`}>
                    {loan.status}
                  </span>
                </td>
                <td>
                  <button className="secondary" onClick={() => handleViewDetails(loan)}>View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LoansList;