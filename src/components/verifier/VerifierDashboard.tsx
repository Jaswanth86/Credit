// src/components/verifier/VerifierDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Button, Badge } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Loan {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  purpose: string;
  duration: number;
  status: string;
  createdAt: string;
}

interface VerifierDashboardProps {
  userId: string;
}

const VerifierDashboard: React.FC<VerifierDashboardProps> = ({ userId }) => {
  const [pendingLoans, setPendingLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalVerified: 0,
    totalRejected: 0,
    averageAmount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch pending loans
        const loansRes = await axios.get('/api/loans/pending', {
          headers: { 'x-auth-token': token }
        });
        
        // Fetch loan statistics
        const statsRes = await axios.get('/api/loans/stats', {
          headers: { 'x-auth-token': token }
        });
        
        setPendingLoans(loansRes.data);
        setStats({
          totalPending: statsRes.data.pendingLoans,
          totalVerified: statsRes.data.verifiedLoans,
          totalRejected: statsRes.data.rejectedLoans,
          averageAmount: statsRes.data.averageLoanAmount
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerify = async (loanId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/loans/${loanId}/verify`, 
        { verifierId: userId },
        { headers: { 'x-auth-token': token } }
      );
      
      // Update pending loans list
      setPendingLoans(pendingLoans.filter(loan => loan._id !== loanId));
      
      // Update stats
      setStats({
        ...stats,
        totalPending: stats.totalPending - 1,
        totalVerified: stats.totalVerified + 1
      });
    } catch (error) {
      console.error('Error verifying loan:', error);
    }
  };

  const handleReject = async (loanId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/loans/${loanId}/reject`, 
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      // Update pending loans list
      setPendingLoans(pendingLoans.filter(loan => loan._id !== loanId));
      
      // Update stats
      setStats({
        ...stats,
        totalPending: stats.totalPending - 1,
        totalRejected: stats.totalRejected + 1
      });
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  // Prepare chart data
  const chartData = {
    labels: ['Pending', 'Verified', 'Rejected'],
    datasets: [
      {
        label: 'Number of Loans',
        data: [stats.totalPending, stats.totalVerified, stats.totalRejected],
        backgroundColor: [
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <h3>Loading...</h3>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mt-4 mb-4">Verifier Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Pending Loans</Card.Title>
              <Card.Text className="display-4">{stats.totalPending}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Verified Loans</Card.Title>
              <Card.Text className="display-4">{stats.totalVerified}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Rejected Loans</Card.Title>
              <Card.Text className="display-4">{stats.totalRejected}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Avg Loan Amount</Card.Title>
              <Card.Text className="display-4">${stats.averageAmount.toFixed(0)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Chart */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h4>Loan Status Distribution</h4>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Number of Loans'
                        }
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Pending Loans Table */}
      <Card className="mb-4">
        <Card.Header>
          <h4>Pending Loans</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Amount</th>
                <th>Purpose</th>
                <th>Duration</th>
                <th>Date Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLoans.length > 0 ? (
                pendingLoans.map(loan => (
                  <tr key={loan._id}>
                    <td>{loan.userId.name}</td>
                    <td>${loan.amount}</td>
                    <td>{loan.purpose}</td>
                    <td>{loan.duration} months</td>
                    <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleVerify(loan._id)}
                      >
                        Verify
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleReject(loan._id)}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center">No pending loans</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default VerifierDashboard;