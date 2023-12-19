//require('dotenv').config(); // To use environment variables
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');

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
  const upload = multer();

// Configure AWS S3
  AWS.config.update({
    accessKeyId: "AKIASZASMGKR25BFESDE",
    secretAccessKey: "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",
    region: "us-east-1"
  });

  const s3 = new AWS.S3();

  // New route for handling file upload
  app.post('/api/newpost', upload.single('file'), (req, res) => {
    const { title, address } = req.body;
    const file = req.file;

    if (!file || file.mimetype !== 'application/pdf') {
      res.status(400).json({ success: false, message: 'Only PDF files are allowed' });
      return;
    }

    const s3Params = {
      Bucket: "vendor-pdf",
      Key: `uploads/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    s3.upload(s3Params, async (err, s3Data) => {
      if (err) {
        console.error('Error uploading to S3', err);
        res.status(500).json({ success: false, message: 'Error uploading file' });
        return;
      }

      // Insert home details into MySQL database
      const sql = 'INSERT INTO HOMES (home, address, pdf_url) VALUES (?, ?, ?)';
      connection.query(sql, [title, address, s3Data.Location], (dbErr, dbResult) => {
        if (dbErr) {
          console.error('Database error', dbErr);
          res.status(500).json({ success: false, message: 'Error saving data to the database' });
          return;
        }

        res.json({ success: true, message: 'Home added and file uploaded successfully', data: dbResult });
      });
    });
  });

  
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


 app.get('/api/homes', (req, res) => {
     const searchKey = req.query.q || ''; // Search keyword
     const page = parseInt(req.query._page, 10) || 1;
     const limit = parseInt(req.query._limit, 10) || PAGE_LIMIT;
     const offset = (page - 1) * limit;

     // SQL query to get homes with pagination and optional search
     let query = 'SELECT * FROM HOMES WHERE home LIKE ? OR address LIKE ? LIMIT ? OFFSET ?';
     let queryParameters = [`%${searchKey}%`, `%${searchKey}%`, limit, offset];

     connection.query(query, queryParameters, (err, results) => {
         if (err) {
             console.error('Database error', err);
             res.status(500).json({ success: false, message: 'Internal server error' });
             return;
         }
         res.json({ success: true, data: results });
     });
 });

// Route to get the details of a specific home by ID
 app.get('/api/homes/:homeId', (req, res) => {
   const { homeId } = req.params;

   // SQL query to get the details of a specific home by ID
   const query = 'SELECT * FROM HOMES WHERE id = ?';

   connection.query(query, [homeId], (err, results) => {
     if (err) {
       console.error('Database error', err);
       res.status(500).json({ success: false, message: 'Internal server error' });
       return;
     }

     if (results.length > 0) {
       res.json({ success: true, data: results[0] });
     } else {
       res.status(404).json({ success: false, message: 'Home not found' });
     }
   });
 });



  
const port = 5000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});