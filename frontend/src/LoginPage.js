import React, { useState } from 'react';
import axios from 'axios';
import './index.css'; 
import logo from './cosmopolitan-logo.png';

const LoginPage = ({ setLoggedIn }) => { // Receive setLoggedIn prop from the parent component
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevents the default form submission behavior
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });
      console.log(response.data);

      // If login is successful, setLoggedIn to true to trigger redirection
      setLoggedIn(true);

      // Handle further actions upon successful login (e.g., redirecting the user)
    } catch (error) {
      console.error('Login error raa', error);
      // Handle login errors (e.g., displaying a message to the user)
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: 'url("marble.png")' }}>
      <div className="logo">
        <img src={logo} alt="Cosmopolitan Tile and Granite Logo" />
      </div>
      <div className="login-form">
        <form id="loginForm" onSubmit={handleLogin}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /><br /><br />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br /><br />
          <input type="submit" value="Login" />
        </form>
        <p><a href="#">Register / Create Account</a></p>
      </div>
    </div>
  );
};

export default LoginPage;
