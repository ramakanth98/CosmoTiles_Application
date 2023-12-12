import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import LoginPage from './LoginPage.js';
import Report from './report.js'; // Import the Report component
import reportWebVitals from './reportWebVitals';

const Root = () => {
  // Define a state to track whether the user is logged in or not
  const [loggedIn, setLoggedIn] = useState(false);

  // Determine which component to render based on the user's authentication status
  const content = loggedIn ? <Report /> : <LoginPage setLoggedIn={setLoggedIn} />;

  return <React.StrictMode>{content}</React.StrictMode>;
};

const rootElement = document.getElementById('root');
ReactDOM.createRoot(rootElement).render(<Root />);

// Performance measuring, can be removed if not used
reportWebVitals();
