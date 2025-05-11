// src/components/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Button, Badge, Tabs, Tab } from 'react-bootstrap';
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
  isVerified: boolean;
  isApproved: boolean;
  verifiedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface LoanStats {
  totalLoans: number;
  pendingLoans: number;
  verifiedLoans: number;
  approvedLoans: number;
  rejectedLoans: number;
  totalLoanAmount: number;
  averageLoanAmount: number;
  monthlyData: Array<{
    _id: { month: number; year: number };
    count: number;
    totalAmount: number;
  }>;
}

interface AdminDashboardProps {
  userId: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ userId }) => {
  const [verifiedLoans, setVerifiedLoans] = useState<Loan[]>([]);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch verified loans
        const verifiedRes = await axios.get('/api/loans/verified', {
          headers: { 'x-auth-token': token }
        });
        
        // Fetch all loans
        const allLoansRes = await axios.get('/api/loans', {
          headers: { 'x-auth-token': token }
        });
        
        // Fetch loan statistics
        const statsRes = await axios.get('/api/loans/stats', {
          headers: { 'x-auth-token': token }
        });
        
        setVerifiedLoans(verifiedRes.data);
        setAllLoans(allLoansRes.data);
        setStats(statsRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApprove = async (loanId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/loans/${loanId}/approve`, 
        { adminId: userId },
        { headers: { 'x-auth-token': token } }
      );
      
      // Update verified loans list
      setVerifiedLoans(verifiedLoans.filter(loan => loan._id !== loanId));
      
      // Update all loans list
      setAllLoans(allLoans.map(loan => 
        loan._id === loanId 
          ? { ...loan, status: 'approved', isApproved: true } 
          : loan
      ));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          verifiedLoans: stats.verifiedLoans - 1,
          approvedLoans: stats.approvedLoans + 1
        });
      }
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  const handleReject = async (loanId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/loans/${loanId}/reject`, 
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      // Update verified loans list
      setVerifiedLoans(verifiedLoans.filter(loan => loan._id !== loanId));
      
      // Update all loans list
      setAllLoans(allLoans.map(loan => 
        loan._id === loanId 
          ? { ...loan, status: 'rejected' } 
          : loan
      ));
      
      // Update stats
      if (stats) {
        setStats({
          ...stats,
          verifiedLoans: stats.verifiedLoans - 1,
          rejectedLoans: stats.rejectedLoans + 1
        });
      }
    } catch (error) {
      console.error('Error rejecting loan:', error);
    }
  };

  // Prepare chart data
  const statusChartData = {
    labels: ['Pending', 'Verified', 'Approved', 'Rejected'],
    datasets: [
      {
        label: 'Number of Loans',
        data: stats ? [
          stats.pendingLoans, 
          stats.verifiedLoans, 
          stats.approvedLoans, 
          stats.rejectedLoans
        ] : [],
        backgroundColor: [
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 99, 132, 0.2)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Monthly loan data chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyChartData = {
    labels: stats?.monthlyData.map(item => `${monthNames[item._id.month - 1]} ${item._id.year}`) || [],
    datasets: [
      {
        label: 'Number of Loans',
        data: stats?.monthlyData.map(item => item.count) || [],
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Total Amount ($)',
        data: stats?.monthlyData.map(item => item.totalAmount) || [],
        fill: false,
        backgroundColor: 'rgb(54, 162, 235)',
        borderColor: 'rgba(54, 162, 235, 0.2)',
        yAxisID: 'y1',
      }
    ],
  };

  if (loading || !stats) {
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
      <h2 className="mt-4 mb-4">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Loans</Card.Title>
              <Card.Text className="display-4">{stats.totalLoans}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Approved Loans</Card.Title>
              <Card.Text className="display-4">{stats.approvedLoans}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Amount</Card.Title>
              <Card.Text className="display-4">${stats.totalLoanAmount.toLocaleString()}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Avg Loan Amount</Card.Title>
              <Card.Text className="display-4">${stats.averageLoanAmount.toFixed(0)}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Charts */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h4>Loan Status Distribution</h4>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={statusChartData} 
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
        <Col md={6}>
          <Card>
            <Card.Header>
              <h4>Monthly Loan Trends</h4>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <Line 
                  data={monthlyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                          display: true,
                          text: 'Number of Loans'
                        }
                      },
                      y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                          drawOnChartArea: false,
                        },
                        title: {
                          display: true,
                          text: 'Amount ($)'
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
      
      {/* Loan Tables */}
      <Card className="mb-4">
        <Card.Header>
          <h4>Loan Management</h4>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="verified" className="mb-3">
            <Tab eventKey="verified" title="Verified Loans">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Duration</th>
                    <th>Verified By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verifiedLoans.length > 0 ? (
                    verifiedLoans.map(loan => (
                      <tr key={loan._id}>
                        <td>{loan.userId.name}</td>
                        <td>${loan.amount}</td>
                        <td>{loan.purpose}</td>
                        <td>{loan.duration} months</td>
                        <td>{loan.verifiedBy?.name || 'Unknown'}</td>
                        <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleApprove(loan._id)}
                          >
                            Approve
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
                      <td colSpan={7} className="text-center">No verified loans pending approval</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Tab>
            <Tab eventKey="all" title="All Loans">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allLoans.length > 0 ? (
                    allLoans.map(loan => (
                      <tr key={loan._id}>
                        <td>{loan.userId.name}</td>
                        <td>${loan.amount}</td>
                        <td>{loan.purpose}</td>
                        <td>
                          <Badge bg={
                            loan.status === 'approved' ? 'success' : 
                            loan.status === 'verified' ? 'info' : 
                            loan.status === 'rejected' ? 'danger' : 
                            'warning'
                          }>
                            {loan.status}
                          </Badge>
                        </td>
                        <td>{new Date(loan.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center">No loans found</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Summary Section */}
      <Card className="mb-4">
        <Card.Header>
          <h4>Loan Summary</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5>Approval Rate</h5>
                  <h2>
                    {stats.totalLoans > 0 
                      ? `${((stats.approvedLoans / stats.totalLoans) * 100).toFixed(1)}%` 
                      : '0%'}
                  </h2>
                  <p className="text-muted">
                    {stats.approvedLoans} approved out of {stats.totalLoans} total loans
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Body>
                  <h5>Pending Approval</h5>
                  <h2>{stats.verifiedLoans}</h2>
                  <p className="text-muted">
                    Verified loans waiting for your decision
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminDashboard;