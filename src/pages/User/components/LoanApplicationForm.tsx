import React, { useState } from 'react';
import { createLoanApplication } from '../../../services/api';
import { LoanType } from '../../../types';

interface LoanApplicationFormProps {
  onSubmitted: () => void;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onSubmitted }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    amount: 0,
    loanType: LoanType.PERSONAL,
    purpose: '',
    interestRate: 10,
    dueDate: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set default due date - 1 year from today
  React.useEffect(() => {
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    setFormData(prev => ({
      ...prev,
      dueDate: oneYearLater.toISOString().split('T')[0]
    }));
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || formData.amount <= 0 || !formData.purpose) {
      setError('Please fill out all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      await createLoanApplication(formData);
      onSubmitted();
    } catch (err) {
      setError('Failed to submit loan application. Please try again.');
      console.error('Error submitting loan application:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="loan-application-form">
      <h2>Apply for a Loan</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="loanType">Loan Type *</label>
            <select
              id="loanType"
              name="loanType"
              value={formData.loanType}
              onChange={handleChange}
              required
            >
              <option value={LoanType.PERSONAL}>Personal</option>
              <option value={LoanType.BUSINESS}>Business</option>
              <option value={LoanType.EDUCATION}>Education</option>
              <option value={LoanType.MORTGAGE}>Mortgage</option>
              <option value={LoanType.AUTO}>Auto</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Loan Amount (USD) *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              min="100"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group full-width">
          <label htmlFor="purpose">Loan Purpose *</label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows={4}
            required
          ></textarea>
        </div>
        
        <div className="form-footer">
          <button 
            type="submit" 
            className="primary" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplicationForm;