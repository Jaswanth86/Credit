// frontend/src/pages/Verifier/VerifierDashboard.tsx
import React, { useState, useEffect } from 'react';
import { getPendingVerifications, verifyUser, rejectVerification } from '../../services/api';
import { Link } from 'react-router-dom';

interface VerificationRequest {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  documentType: 'nationalId' | 'passport' | 'driversLicense';
  documentNumber: string;
  documentImages: string[];
  additionalInfo?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
}

const VerifierDashboard: React.FC = () => {
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchVerificationRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await getPendingVerifications();
      setVerificationRequests(requests);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationRequests();
    
    // Set up a polling interval to check for new verification requests
    const intervalId = setInterval(fetchVerificationRequests, 60000); // every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewRequest = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setNotesInput(request.notes || '');
    setCurrentImageIndex(0);
    setStatusMessage(null);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setNotesInput('');
  };

  const handleApproveVerification = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsProcessing(true);
      setStatusMessage(null);
      
      await verifyUser(selectedRequest.userId, notesInput);
      
      // Update the request in state
      setVerificationRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === selectedRequest._id ? { ...req, status: 'approved', notes: notesInput } : req
        )
      );
      
      setStatusMessage({
        text: 'User verification approved successfully',
        type: 'success'
      });
      
      // Close the details view after a brief delay
      setTimeout(() => {
        handleCloseDetails();
      }, 2000);
      
    } catch (err) {
      console.error('Error approving verification:', err);
      setStatusMessage({
        text: 'Failed to approve verification. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectVerification = async () => {
    if (!selectedRequest) return;
    
    try {
      setIsProcessing(true);
      setStatusMessage(null);
      
      if (!notesInput.trim()) {
        setStatusMessage({
          text: 'Please provide a reason for rejection',
          type: 'error'
        });
        setIsProcessing(false);
        return;
      }
      
      await rejectVerification(selectedRequest.userId, notesInput);
      
      // Update the request in state
      setVerificationRequests(prevRequests => 
        prevRequests.map(req => 
          req._id === selectedRequest._id ? { ...req, status: 'rejected', notes: notesInput } : req
        )
      );
      
      setStatusMessage({
        text: 'User verification rejected',
        type: 'success'
      });
      
      // Close the details view after a brief delay
      setTimeout(() => {
        handleCloseDetails();
      }, 2000);
      
    } catch (err) {
      console.error('Error rejecting verification:', err);
      setStatusMessage({
        text: 'Failed to reject verification. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextImage = () => {
    if (!selectedRequest) return;
    
    if (currentImageIndex < selectedRequest.documentImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const filteredRequests = verificationRequests.filter(request => {
    // Apply status filter
    if (filterStatus !== 'all' && request.status !== filterStatus) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        request._id.toLowerCase().includes(query) ||
        request.fullName.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query) ||
        request.documentNumber.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

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
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const renderVerificationStats = () => {
    const pendingCount = verificationRequests.filter(req => req.status === 'pending').length;
    const approvedCount = verificationRequests.filter(req => req.status === 'approved').length;
    const rejectedCount = verificationRequests.filter(req => req.status === 'rejected').length;
    
    return (
      <div className="verification-stats">
        <div className="stat-card pending">
          <h3>Pending</h3>
          <p className="stat-count">{pendingCount}</p>
        </div>
        <div className="stat-card approved">
          <h3>Approved</h3>
          <p className="stat-count">{approvedCount}</p>
        </div>
        <div className="stat-card rejected">
          <h3>Rejected</h3>
          <p className="stat-count">{rejectedCount}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="verifier-dashboard">
      <div className="dashboard-header">
        <h2>Verifier Dashboard</h2>
        <div className="nav-links">
          <Link to="/verifier/history" className="btn btn-secondary">Verification History</Link>
        </div>
      </div>
      
      {renderVerificationStats()}
      
      {selectedRequest ? (
        <div className="verification-details">
          <div className="details-header">
            <h3>Verification Request Details</h3>
            <button 
              className="btn btn-secondary"
              onClick={handleCloseDetails}
            >
              Back to Requests
            </button>
          </div>
          
          <div className="details-container">
            <div className="user-info">
              <h4>{selectedRequest.fullName}</h4>
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              <p><strong>Phone:</strong> {selectedRequest.phone}</p>
              <p><strong>Document Type:</strong> {documentTypeLabel(selectedRequest.documentType)}</p>
              <p><strong>Document Number:</strong> {selectedRequest.documentNumber}</p>
              <p><strong>Submitted:</strong> {formatDate(selectedRequest.submittedAt)}</p>
              <p><strong>Status:</strong> <span className={getStatusClass(selectedRequest.status)}>{selectedRequest.status}</span></p>
              
              {selectedRequest.additionalInfo && (
                <div className="additional-info">
                  <h5>Additional Information</h5>
                  <p>{selectedRequest.additionalInfo}</p>
                </div>
              )}
            </div>
            
            <div className="document-images">
              <h4>Document Images</h4>
              <div className="image-viewer">
                {selectedRequest.documentImages.length > 0 ? (
                  <>
                    <div className="main-image">
                      <img 
                        src={selectedRequest.documentImages[currentImageIndex]} 
                        alt={`Document ${currentImageIndex + 1}`} 
                      />
                    </div>
                    <div className="image-navigation">
                      <button 
                        onClick={handlePrevImage} 
                        disabled={currentImageIndex === 0}
                      >
                        Previous
                      </button>
                      <span>Image {currentImageIndex + 1} of {selectedRequest.documentImages.length}</span>
                      <button 
                        onClick={handleNextImage} 
                        disabled={currentImageIndex >= selectedRequest.documentImages.length - 1}
                      >
                        Next
                      </button>
                    </div>
                    <div className="image-thumbnails">
                      {selectedRequest.documentImages.map((img, index) => (
                        <div 
                          key={index} 
                          className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <img src={img} alt={`Thumbnail ${index + 1}`} />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>No document images available</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="verification-actions">
            <div className="notes-field">
              <label htmlFor="notes">Notes (required for rejection):</label>
              <textarea
                id="notes"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                rows={4}
                placeholder="Enter your notes about this verification..."
              ></textarea>
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn btn-danger"
                onClick={handleRejectVerification}
                disabled={isProcessing || selectedRequest.status !== 'pending'}
              >
                Reject Verification
              </button>
              <button 
                className="btn btn-success"
                onClick={handleApproveVerification}
                disabled={isProcessing || selectedRequest.status !== 'pending'}
              >
                Approve Verification
              </button>
            </div>
            
            {statusMessage && (
              <div className={`status-message ${statusMessage.type}`}>
                {statusMessage.text}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="filter-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name, email, or document number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="status-filter">
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading">Loading verification requests...</div>
          ) : (
            <div className="verification-requests-container">
              {filteredRequests.length > 0 ? (
                <table className="verification-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Document Type</th>
                      <th>Document Number</th>
                      <th>Submitted</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map(request => (
                      <tr key={request._id}>
                        <td>{request.fullName}</td>
                        <td>{request.email}</td>
                        <td>{documentTypeLabel(request.documentType)}</td>
                        <td>{request.documentNumber}</td>
                        <td>{formatDate(request.submittedAt)}</td>
                        <td>
                          <span className={getStatusClass(request.status)}>
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleViewRequest(request)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-requests">
                  <p>No verification requests found matching the criteria</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VerifierDashboard;