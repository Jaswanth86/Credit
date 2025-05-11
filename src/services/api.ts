// frontend/src/services/api.ts
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configure axios with auth token
const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// User management functions
export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getUserLoans = async (userId: string) => {
  const response = await api.get(`/admin/users/${userId}/loans`);
  return response.data;
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const response = await api.patch(`/admin/users/${userId}/status`, { isActive });
  return response.data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role });
  return response.data;
};

// Verification functions
export const getPendingVerifications = async () => {
  const response = await api.get('/verifier/verifications');
  return response.data;
};

export const getVerificationHistory = async (filters = {}) => {
  const response = await api.get('/verifier/verifications/history', { params: filters });
  return response.data;
};

export const verifyUser = async (userId: string, notes: string) => {
  const response = await api.post(`/verifier/verifications/${userId}/approve`, { notes });
  return response.data;
};

export const rejectVerification = async (userId: string, notes: string) => {
  const response = await api.post(`/verifier/verifications/${userId}/reject`, { notes });
  return response.data;
};

// Loan related functions
export const getLoansByStatus = async (status: string) => {
  const response = await api.get(`/loans`, { params: { status } });
  return response.data;
};

export const getLoanDetails = async (loanId: string) => {
  const response = await api.get(`/loans/${loanId}`);
  return response.data;
};

export const approveLoan = async (loanId: string, notes: string = '') => {
  const response = await api.post(`/loans/${loanId}/approve`, { notes });
  return response.data;
};

export const rejectLoan = async (loanId: string, reason: string) => {
  const response = await api.post(`/loans/${loanId}/reject`, { reason });
  return response.data;
};

// Dashboard statistics
export const getVerifierStats = async () => {
  const response = await api.get('/verifier/stats');
  return response.data;
};

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

// Added missing functions

export const getAllLoans = async () => {
  const response = await api.get('/admin/loans');
  return response.data;
};

export const updateLoanStatus = async (loanId: string, status: string, notes: string = '') => {
  const response = await api.patch(`/admin/loans/${loanId}/status`, { status, notes });
  return response.data;
};

export const createLoanApplication = async (loanData: any) => {
  const response = await api.post('/loans', loanData);
  return response.data;
};

export default api;
