// src/components/user/LoanApplicationForm.tsx
import React, { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

interface LoanApplicationFormProps {
  onSubmit: (data: LoanFormData) => void;
  onCancel: () => void;
}

interface LoanFormData {
  amount: number;
  purpose: string;
  duration: number;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<LoanFormData>({
    amount: 5000,
    purpose: '',
    duration: 12
  });
  const [validated, setValidated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' || name === 'duration' ? Number(value) : value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    onSubmit(formData);
  };

  // Calculate monthly payment (simple calculation)
  const monthlyPayment = (formData.amount * (1 + (0.05 * formData.duration / 12))) / formData.duration;

  return (
    <Card className="mb-4">
      <Card.Header>
        <h3>Apply For A Loan</h3>
      </Card.Header>
      <Card.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="loanAmount">
                <Form.Label>Loan Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter loan amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min={1000}
                  max={100000}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid amount between $1,000 and $100,000.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="loanDuration">
                <Form.Label>Duration (months)</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter loan duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min={3}
                  max={60}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please enter a valid duration between 3 and 60 months.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3" controlId="loanPurpose">
            <Form.Label>Loan Purpose</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter the purpose of your loan"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide the purpose of your loan.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Loan summary */}
          <Card className="mb-3 bg-light">
            <Card.Body>
              <h5>Loan Summary</h5>
              <p><strong>Principal Amount:</strong> ${formData.amount}</p>
              <p><strong>Interest Rate:</strong> 5% per annum</p>
              <p><strong>Duration:</strong> {formData.duration} months</p>
              <p><strong>Monthly Payment:</strong> ${monthlyPayment.toFixed(2)}</p>
              <p><strong>Total Repayment:</strong> ${(monthlyPayment * formData.duration).toFixed(2)}</p>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onCancel} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Submit Application
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default LoanApplicationForm;