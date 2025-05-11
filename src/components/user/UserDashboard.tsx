// src/components/user/UserDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Button, Table } from 'react-bootstrap';
import LoanApplicationForm from './LoanApplicationForm';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Loan {
  _id: string;
  amount: number;
  purpose: string;
  duration: number;
  interestRate: number;
  status: string;
  createdAt: string;
}

interface UserDashboardProps {
  userId: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userId }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    // Fetch user's loans
    const fetchLoans = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/loans/user/${userId}`, {
          headers: { 'x-auth-token': token }
        });
        
        setLoans(response.data);
        
        // Calculate total loan amount
        const total = response.data.reduce((sum: number, loan: Loan) => {
          if (loan.status === 'approved') {
            return sum + loan.amount;
          }
          return sum;
        }, 0);
        
        setTotalAmount(total);
        
        // For this example, we'll set remaining amount as 70% of total
        // In a real app, you'd calculate this based on payments made
        setRemainingAmount(total * 0.7);
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };

    if (userId) {
      fetchLoans();
    }
  }, [userId]);

  // Handle loan application submission
  const handleLoanSubmit = async (loanData: any) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/loans', 
        { ...loanData, userId },
        { headers: { 'x-auth-token': token } }
      );
      
      // Refresh loans data
      const response = await axios.get(`/api/loans/user/${userId}`, {
        headers: { 'x-auth-token': token }
      });
      
      setLoans(response.data);
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting loan application:', error);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: loans.map(loan => new Date(loan.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Loan Amount ($)',
        data: loans.map(loan => loan.amount),
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <Container>
      <h2 className="mt-4 mb-4">User Dashboard</h2>
      
      {/* Loan Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Loans</Card.Title>
              <Card.Text className="display-4">
                {loans.filter(loan => loan.status === 'approved').length}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Amount</Card.Title>
              <Card.Text className="display-4">
                ${totalAmount}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Remaining Balance</Card.Title>
              <Card.Text className="display-4">
                ${remainingAmount.toFixed(2)}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Loan Application Button */}
      <div className="mb-4 text-center">
        {!showForm ? (
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => setShowForm(true)}
          >
            Apply For A Loan
          </Button>
        ) : (
          <LoanApplicationForm 
            onSubmit={handleLoanSubmit} 
            onCancel={() => setShowForm(false)}
          />
        )}
      </div>
      
      {/* Loans Table */}
      <Card className="mb-4">
        <Card.Header>
          <h4>Applied Loans</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Duration</th>
                <th>Interest Rate</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loans.length > 0 ? (
                loans.map(loan => (
                  <tr key={loan._id}>
                    <td>${loan.amount}</td>
                    <td>{loan.purpose}</td>
                    <td>{loan.duration} months</td>
                    <td>{loan.interestRate}%</td>
                    <td>
                      <span className={`badge ${loan.status === 'approved' ? 'bg-success' : loan.status === 'verified' ? 'bg-warning' : loan.status === 'rejected' ? 'bg-danger' : 'bg-secondary'}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">No loans applied yet</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      
      {/* Chart */}
      {loans.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h4>Loan History</h4>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '300px' }}>
              <Line 
                data={chartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Amount ($)'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Date'
                      }
                    }
                  }
                }} 
              />
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default UserDashboard;