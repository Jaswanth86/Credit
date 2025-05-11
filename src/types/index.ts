// frontend/src/types/index.ts

export enum LoanStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum LoanType {
  PERSONAL = 'personal',
  HOME = 'home',
  AUTO = 'auto',
  EDUCATION = 'education',
  BUSINESS = 'business',
  MORTGAGE = 'mortgage'
}

export interface AdminStats {
  totalUsers: number;
  totalLoans: number;
  totalAmountLoaned: number;
  totalPendingLoans: number;
  totalApprovedLoans: number;
  totalRejectedLoans: number;
  totalVerifiedLoans: number;

  loansByStatus: {
    pending: number;
    verified: number;
    approved: number;
    rejected: number;
  };

  totalAmountDisbursed: number;
  totalAmountCollected: number;
  outstandingAmount: number;
  activeUsers: number;
  defaultRate: number;
}

export enum UserRole {
  USER = 'user',
  VERIFIER = 'verifier',
  ADMIN = 'admin'
}

export interface Loan {
  _id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  amount: number;
  loanType: LoanType;
  purpose: string;
  status: LoanStatus;
  createdAt: string;
  updatedAt: string;
  amountPaid: number;
  dueDate: string;
  interestRate: number;
  verifiedBy?: string;
  approvedBy?: string;
  verifiedAt?: string;
  approvedAt?: string;
}

export interface LoanFormData {
  fullName: string;
  email: string;
  phone: string;
  amount: number;
  loanType: LoanType;
  purpose: string;
  interestRate: number;
  dueDate: string;
}

export interface UserStats {
  totalBorrowed: number;
  totalToRepay: number;
  totalPaid: number;
  totalOutstanding: number;
  loansByStatus: {
    pending: number;
    verified: number;
    approved: number;
    rejected: number;
  };
  recentLoans: Loan[];
  loanCount: number;
}

export interface VerifierStats {
  pendingVerificationCount: number;
  pendingVerificationLoans: Loan[];
  loansByType: {
    _id: string;
    count: number;
  }[];
  totalPendingAmount: number;
}

export interface DashboardStats {
  totalLoans: number;
  totalApprovedAmount: number;
  pendingVerificationCount: number;
  pendingApprovalCount: number;
  approvedLoansCount: number;
  rejectedLoansCount: number;
  loansByType: {
    _id: string;
    count: number;
    totalAmount: number;
  }[];
  monthlyApplications: {
    _id: {
      month: number;
      year: number;
    };
    count: number;
    totalAmount: number;
  }[];
}

export interface Payment {
  _id: string;
  loanId: string;
  userId: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}