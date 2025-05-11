import React, { useState } from 'react';

interface RegisterProps {
  setUser: (user: any) => void;
}

const Register: React.FC<RegisterProps> = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Registration failed');
        return;
      }
      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
    } catch (err) {
      setError('An error occurred during registration');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
