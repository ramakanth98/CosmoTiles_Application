import React, { useState } from 'react';
import axios from 'axios';
import './index.css'; 
import logo from './Cos (1).png';
import marble from './marble.png';

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

      // if (response.data.success) {
      //   // If login is successful, setLoggedIn to true to trigger redirection
      //   setLoggedIn(true);
      //   // Handle further actions upon successful login (e.g., redirecting the user)
      // } else {
      //   // If login is not successful, show an error message
      //   alert(response.data.message); // You can replace this with a more elegant solution
      // }
      setLoggedIn(true);

      // Handle further actions upon successful login (e.g., redirecting the user)
    } catch (error) {
      console.error('Login error', error);
      // Handle login errors (e.g., displaying a message to the user)
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${marble})` }}>
      <div className="logo">
        <img src={logo} alt="Cosmopolitan Tile and Granite Logo" />
      </div>
      <div className="login-form">
      <form id="loginForm" onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="text"
            id="username"
            name="username"
            className="form-input"
            placeholder="Username" // Placeholder added here
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            id="password"
            name="password"
            className="form-input"
            placeholder="Password" // Placeholder added here
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <input type="submit" value="Login" className="form-submit" />
      </form>
        {/* <p><a href="#" className="form-link">Register / Create Account</a></p> */}
        {/* <p><Link to="/register" className="form-link">Register / Create Account</Link></p> */}
      </div>
    </div>
  );
};

export default LoginPage;

//   return (
//     <div className="login-container" style={{ backgroundImage: 'url(${marble})' }}>
//       <div className="logo">
//         <img src={logo} alt="Cosmopolitan Tile and Granite Logo" />
//       </div>
//       <div className="login-form">
//         <form id="loginForm" onSubmit={handleLogin}>
//           <label htmlFor="username">Username:</label>
//           <input
//             type="text"
//             id="username"
//             name="username"
//             value={username}
//             onChange={(e) => setUsername(e.target.value)}
//           /><br /><br />
//           <label htmlFor="password">Password:</label>
//           <input
//             type="password"
//             id="password"
//             name="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           /><br /><br />
//           <input type="submit" value="Login" />
//         </form>
//         <p><a href="#">Register / Create Account</a></p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
