// frontend/src/pages/Verifier/VerificationHistory.tsx
import React, { useState, useEffect } from 'react';
import { getVerificationHistory } from '../../services/api';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface VerificationRecord {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  status: 'approved' | 'rejected';
  submittedAt: string;
  processedAt: string;
  processedBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  notes?: string;
}

const VerificationHistory: React.FC = () => {
  const [verificationRecords, setVerificationRecords] = useState<VerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'rejected'>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const fetchVerificationHistory = async () => {
    try {
      setIsLoading(true);
      
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (startDate) {
        filters.startDate = startDate.toISOString();
      }
      if (endDate) {
        filters.endDate = endDate.toISOString();
      }
      
      const records = await getVerificationHistory(filters);
      setVerificationRecords(records);
      setCurrentPage(1); // Reset to first page when filters change
    } catch (err) {
      console.error('Error fetching verification history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationHistory();
  }, [statusFilter, startDate, endDate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewRecord = (record: VerificationRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setStartDate(null);
    setEndDate(null);
    setSearchQuery('');
  };

  const documentTypeLabel = (type: string) => {
    switch (type) {
      case 'nationalId': return 'National ID';
      case 'passport': return 'Passport';
      case 'driversLicense': return 'Driver\'s License';
      default: return type;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  // Filter records based on search query
  const filteredRecords = verificationRecords.filter(record => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      record._id.toLowerCase().includes(query) ||
      record.fullName.toLowerCase().includes(query) ||
      record.email.toLowerCase().includes(query) ||
      record.documentNumber.toLowerCase().includes(query) ||
      record.processedBy.fullName.toLowerCase().includes(query) ||
      (record.notes && record.notes.toLowerCase().includes(query))
    );
  });

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div className="pagination">
        <button 
          onClick={() => paginate(currentPage - 1)} 
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          onClick={() => paginate(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="verification-history">
      <div className="page-header">
        <h2>Verification History</h2>
        <div className="nav-links">
          <Link to="/verifier/dashboard" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
      
      {selectedRecord ? (
        <div className="record-details">
          <div className="details-header">
            <h3>Verification Record Details</h3>
            <button 
              className="btn btn-secondary"
              onClick={handleCloseDetails}
            >
              Back to History
            </button>
          </div>
          
          <div className="details-content">
            <div className="record-info">
              <h4>{selectedRecord.fullName}</h4>
              <div className="info-grid">
                <div className="info-group">
                  <h5>User Information</h5>
                  <p><strong>Email:</strong> {selectedRecord.email}</p>
                  <p><strong>Document Type:</strong> {documentTypeLabel(selectedRecord.documentType)}</p>
                  <p><strong>Document Number:</strong> {selectedRecord.documentNumber}</p>
                  <p><strong>Status:</strong> <span className={getStatusClass(selectedRecord.status)}>{selectedRecord.status}</span></p>
                </div>
                
                <div className="info-group">
                  <h5>Verification Information</h5>
                  <p><strong>Submitted:</strong> {formatDate(selectedRecord.submittedAt)}</p>
                  <p><strong>Processed:</strong> {formatDate(selectedRecord.processedAt)}</p>
                  <p><strong>Verified By:</strong> {selectedRecord.processedBy.fullName}</p>
                  <p><strong>Verifier Email:</strong> {selectedRecord.processedBy.email}</p>
                </div>
              </div>
              
              {selectedRecord.notes && (
                <div className="notes-section">
                  <h5>Notes</h5>
                  <p className="notes-content">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="filter-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, email, document number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filters">
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Start Date:</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={new Date()}
                  placeholderText="Select start date"
                  className="date-picker"
                />
              </div>
              
              <div className="filter-group">
                <label>End Date:</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => setEndDate(date)}
                  selectsEnd
                   startDate={startDate}
                   endDate={endDate}
                   minDate={startDate || undefined}
                  maxDate={new Date()}
                  placeholderText="Select end date"
                  className="date-picker"
                />
              </div>
              
              <button 
                className="btn btn-secondary"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading">Loading verification history...</div>
          ) : (
            <div className="history-records">
              {currentRecords.length > 0 ? (
                <>
                  <table className="records-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Document Type</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Processed</th>
                        <th>Verified By</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.map(record => (
                        <tr key={record._id}>
                          <td>{record.fullName}</td>
                          <td>{record.email}</td>
                          <td>{documentTypeLabel(record.documentType)}</td>
                          <td>
                            <span className={getStatusClass(record.status)}>
                              {record.status}
                            </span>
                          </td>
                          <td>{formatDate(record.submittedAt)}</td>
                          <td>{formatDate(record.processedAt)}</td>
                          <td>{record.processedBy.fullName}</td>
                          <td>
                            <button 
                              className="btn btn-primary"
                              onClick={() => handleViewRecord(record)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {renderPagination()}
                </>
              ) : (
                <div className="no-records">
                  <p>No verification records found matching the criteria</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerificationHistory;