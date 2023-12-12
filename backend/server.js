//require('dotenv').config(); // To use environment variables
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

// Set up MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'cosmo_db'
});

connection.connect(err => {
    if (err) {
      console.error('Error connecting to the database', err);
      return;
    }
    console.log('Connected to the database');
  });
  
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  
  // Handle login POST request
  app.post('/api/login', (req, res) => {
  console.log('Received a login request');
    const { username, password } = req.body;
    // SQL query to check the user
    const query = 'SELECT * FROM USERS WHERE username = ? AND password = ? LIMIT 1;';
    connection.query(query, [username, password], (err, results) => {
      if (err) {
        console.error('Database error', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
        return;
      }
  
      if (results.length > 0) {
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.json({ success: false, message: 'Invalid username or password' });
      }
    });
  });
  
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});