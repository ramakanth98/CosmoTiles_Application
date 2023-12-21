import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import NewPost from './newhome.js';
import LoginPage from './LoginPage.js';
import Report from './report.js';
import Home from './home.js';
import HomeDetail from './homedetail.js'; // Import the HomeDetail component
import reportWebVitals from './reportWebVitals';

const Root = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={loggedIn ? <Navigate to="/home" /> : <LoginPage setLoggedIn={setLoggedIn} />} />
        <Route path="/home" element={loggedIn ? <Home /> : <Navigate to="/" />} />
        <Route path="/home/:homeId" element={loggedIn ? <HomeDetail /> : <Navigate to="/" />} /> {/* Add this line */}
        <Route path="/new" element={loggedIn ? <NewPost /> : <Navigate to="/" />} />
        <Route path="/report/:homeId" element={loggedIn ? <Report /> : <Navigate to="/" />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

reportWebVitals();
