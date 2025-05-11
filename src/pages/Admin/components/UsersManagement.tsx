// frontend/src/pages/Admin/components/UsersManagement.tsx
import React, { useState, useEffect } from 'react';
import { getAllUsers, getUserLoans, updateUserStatus } from '../../../services/api';

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  isActive: boolean;
  isVerified: boolean;
  role: 'user' | 'verifier' | 'admin';
  createdAt: string;
  totalLoans: number;
  activeLoans: number;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserLoans, setSelectedUserLoans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'verifier' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await getAllUsers();
      
      // Enhance user data with loan counts (in a real app this might come from the API)
      const enhancedUsers = usersData.map(user => ({
        ...user,
        totalLoans: Math.floor(Math.random() * 10), // This is just for mock data
        activeLoans: Math.floor(Math.random() * 5)  // This is just for mock data
      }));
      
      setUsers(enhancedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setStatusMessage(null);
    
    try {
      const loans = await getUserLoans(user._id);
      setSelectedUserLoans(loans);
    } catch (err) {
      console.error('Error fetching user loans:', err);
    }
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setSelectedUserLoans([]);
  };

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      setIsProcessing(true);
      setStatusMessage(null);
      
      await updateUserStatus(userId, isActive);
      
      // Update the user in state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, isActive } : user
        )
      );
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, isActive } : null);
      }
      
      setStatusMessage({
        text: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating user status:', err);
      setStatusMessage({
        text: 'Failed to update user status. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'user' | 'verifier' | 'admin') => {
    try {
      setIsProcessing(true);
      setStatusMessage(null);
      
      // In a real app, this would be an API call
      // await updateUserRole(userId, newRole);
      
      // Update the user in state (mock implementation)
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
      }
      
      setStatusMessage({
        text: `User role updated to ${newRole} successfully`,
        type: 'success'
      });
    } catch (err) {
      console.error('Error updating user role:', err);
      setStatusMessage({
        text: 'Failed to update user role. Please try again.',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Apply role filter
    if (roleFilter !== 'all' && user.role !== roleFilter) {
      return false;
    }
    
    // Apply status filter
    if (statusFilter === 'active' && !user.isActive) {
      return false;
    }
    if (statusFilter === 'inactive' && user.isActive) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user._id.toLowerCase().includes(query) ||
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="users-management">
      <h2>Users Management</h2>
      
      {selectedUser ? (
        <div className="user-details-view">
          <div className="details-header">
            <h3>User Details</h3>
            <button 
              className="btn btn-secondary"
              onClick={handleCloseDetails}
            >
              Back to Users List
            </button>
          </div>
          
          <div className="details-container">
            <div className="user-info">
              <h4>{selectedUser.fullName}</h4>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              <p><strong>Verified:</strong> {selectedUser.isVerified ? 'Yes' : 'No'}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
              <p><strong>Total Loans:</strong> {selectedUser.totalLoans}</p>
              <p><strong>Active Loans:</strong> {selectedUser.activeLoans}</p>
            </div>
            
            <div className="user-actions">
              <h4>Actions</h4>
              <div className="action-buttons">
                <button 
                  className={`btn ${selectedUser.isActive ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => handleUpdateUserStatus(selectedUser._id, !selectedUser.isActive)}
                  disabled={isProcessing}
                >
                  {selectedUser.isActive ? 'Deactivate User' : 'Activate User'}
                </button>
                
                <div className="role-change">
                  <select 
                    value={selectedUser.role}
                    onChange={(e) => handleChangeRole(
                      selectedUser._id, 
                      e.target.value as 'user' | 'verifier' | 'admin'
                    )}
                    disabled={isProcessing}
                  >
                    <option value="user">User</option>
                    <option value="verifier">Verifier</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleChangeRole(
                      selectedUser._id, 
                      selectedUser.role
                    )}
                    disabled={isProcessing}
                  >
                    Update Role
                  </button>
                </div>
              </div>
              
              {statusMessage && (
                <div className={`status-message ${statusMessage.type}`}>
                  {statusMessage.text}
                </div>
              )}
            </div>
          </div>
          
          <div className="user-loans">
            <h4>User Loans</h4>
            {selectedUserLoans.length > 0 ? (
              <table className="loans-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUserLoans.map(loan => (
                    <tr key={loan._id}>
                      <td>{loan._id}</td>
                      <td>${loan.amount.toFixed(2)}</td>
                      <td>{loan.status}</td>
                      <td>{formatDate(loan.createdAt)}</td>
                      <td>{formatDate(loan.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No loans found for this user.</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search users by name, email, phone or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filter-options">
              <div className="filter-group">
                <label>Role:</label>
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                >
                  <option value="all">All Roles</option>
                  <option value="user">Users</option>
                  <option value="verifier">Verifiers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Joined</th>
                    <th>Loans</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>{user.role}</td>
                        <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                        <td>{user.isVerified ? 'Yes' : 'No'}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{user.activeLoans} / {user.totalLoans}</td>
                        <td>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleViewUser(user)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9}>No users found matching the criteria</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersManagement;