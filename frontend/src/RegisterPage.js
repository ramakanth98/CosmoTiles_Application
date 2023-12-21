import React, { useState } from 'react';
import axios from 'axios';
import './styles.css'; // assuming this is where your styles are defined


const RegisterPage = ({ history }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');   
  const [error, setError] = useState('');

  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        password,
      });

      // If registration is successful, redirect to the login page
      history.push('/login');
    } catch (error) {
      console.error('Registration error', error);
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
      <form onSubmit={handleRegister}>
        <label htmlFor="username">Username:</label>
        <input
            type="text"
            id="username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />

        <label htmlFor="password">Password:</label>
        <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
            type="password"
            id="confirmPassword"
            className="form-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <div className="error-message">{error}</div>}
        <input type="submit" value="Register" className="form-submit" />
    </form>

      </div>
    </div>
  );
};

export default RegisterPage;
