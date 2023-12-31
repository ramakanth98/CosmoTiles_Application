require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Set up MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
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



app.post('/generate-pdf', async (req, res) => {
    try {
        const reportData = req.body; // Data from the front-end
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Construct HTML content from reportData
        let htmlContent = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .table-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr); /* 2 tables per row */
                    grid-gap: 20px;
                    margin-bottom: 20px;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid black;
                    padding: 5px;
                    text-align: left;
                }
                .grand-total {
                    font-size: 1.2em;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>Report</h1>`;

        // Group bath tables into pairs
        for (let i = 0; i < reportData.bathTables.length; i += 2) {
            htmlContent += `<div class="table-container">`;
            for (let j = i; j < i + 2 && j < reportData.bathTables.length; j++) {
                htmlContent += `<div><h2>Bath ${j + 1}</h2><table>`;
                htmlContent += `<tr><th>WorkName</th><th>SQFT</th><th>Price</th><th>Total</th></tr>`;
                reportData.bathTables[j].rows.forEach(row => {
                    htmlContent += `<tr><td>${row.workName}</td><td>${row.sqft}</td><td>${row.price}</td><td>${row.total}</td></tr>`;
                });
                htmlContent += `<tr><td colspan="3">Table Total</td><td>${reportData.bathTables[j].tableTotal}</td></tr></table></div>`;
            }
            htmlContent += `</div>`;
        }

        // Kitchen table (if needed, you can also apply the grid layout to the kitchen table)
        htmlContent += `<h2>Additional Charges</h2><table>`;
        htmlContent += `<tr><th>WorkName</th><th>SQFT</th><th>Price</th><th>Total</th></tr>`;
        reportData.kitchenTable.rows.forEach(row => {
            htmlContent += `<tr><td>${row.workName}</td><td>${row.sqft}</td><td>${row.price}</td><td>${row.total}</td></tr>`;
        });
        htmlContent += `<tr><td colspan="3">Table Total</td><td>${reportData.kitchenTable.tableTotal}</td></tr></table>`;

        // Grand Total
        htmlContent += `<div class="grand-total">Grand Total: ${reportData.grandTotal}</div>`;

        htmlContent += `</body></html>`;

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A2' });

        await browser.close();


        // Generate a unique filename
            const fileName = `report-${uuidv4()}.pdf`;

        // Upload the PDF to S3
        const s3Params = {
            Bucket: "screport-pdf",
            Key: fileName,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            ACL: 'public-read'
        };

        s3.upload(s3Params, async (err, s3Data) => {
            if (err) {
                console.error('Error uploading to S3', err);
                return res.status(500).send('Error uploading to S3');
            }

            // SQL to update or insert the PDF URL in the database
            const updateSql = 'UPDATE HOMES SET screport_url = ? WHERE id = ?';
            connection.query(updateSql, [s3Data.Location, reportData.homeId], (updateErr, updateResult) => {
                    if (updateErr) {
                      throw new Error('Error updating database');
                    }

                    // Send the PDF in the response
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                    res.send(pdfBuffer);
               });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.post('/generateinvoice-pdf', async (req, res) => {
    try {
        const reportData = req.body; // Data from the front-end
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Construct HTML content from reportData
        let htmlContent = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .table-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr); /* 2 tables per row */
                    grid-gap: 20px;
                    margin-bottom: 20px;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid black;
                    padding: 5px;
                    text-align: left;
                }
                .grand-total {
                    font-size: 1.2em;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>Report</h1>`;

        // Group bath tables into pairs
        for (let i = 0; i < reportData.bathTables.length; i += 2) {
            htmlContent += `<div class="table-container">`;
            for (let j = i; j < i + 2 && j < reportData.bathTables.length; j++) {
                htmlContent += `<div><h2>Bath ${j + 1}</h2><table>`;
                htmlContent += `<tr><th>WorkName</th><th>SQFT</th><th>Price</th><th>Total</th></tr>`;
                reportData.bathTables[j].rows.forEach(row => {
                    htmlContent += `<tr><td>${row.workName}</td><td>${row.sqft}</td><td>${row.price}</td><td>${row.total}</td></tr>`;
                });
                htmlContent += `<tr><td colspan="3">Table Total</td><td>${reportData.bathTables[j].tableTotal}</td></tr></table></div>`;
            }
            htmlContent += `</div>`;
        }

        // Kitchen table (if needed, you can also apply the grid layout to the kitchen table)
        htmlContent += `<h2>Additional Charges</h2><table>`;
        htmlContent += `<tr><th>WorkName</th><th>SQFT</th><th>Price</th><th>Total</th></tr>`;
        reportData.kitchenTable.rows.forEach(row => {
            htmlContent += `<tr><td>${row.workName}</td><td>${row.sqft}</td><td>${row.price}</td><td>${row.total}</td></tr>`;
        });
        htmlContent += `<tr><td colspan="3">Table Total</td><td>${reportData.kitchenTable.tableTotal}</td></tr></table>`;

        // Grand Total
        htmlContent += `<div class="grand-total">Grand Total: ${reportData.grandTotal}</div>`;

        htmlContent += `</body></html>`;

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A2' });

        await browser.close();


        // Generate a unique filename
            const fileName = `report-${uuidv4()}.pdf`;

        // Upload the PDF to S3
        const s3Params = {
            Bucket: "invoiceurl-pdf",
            Key: fileName,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            ACL: 'public-read'
        };

        s3.upload(s3Params, async (err, s3Data) => {
            if (err) {
                console.error('Error uploading to S3', err);
                return res.status(500).send('Error uploading to S3');
            }

            // SQL to update or insert the PDF URL in the database
            const updateSql = 'UPDATE HOMES SET invoice_url = ? WHERE id = ?';
            connection.query(updateSql, [s3Data.Location, reportData.homeId], (updateErr, updateResult) => {
                    if (updateErr) {
                      throw new Error('Error updating database');
                    }

                    // Send the PDF in the response
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                    res.send(pdfBuffer);
               });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

app.post('/generate-oak-pdf', async (req, res) => {
    try {
        const reportData = req.body; // Data from the front-end
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Construct HTML content from reportData
        let htmlContent = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .table-container {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr); /* 2 tables per row */
                    grid-gap: 20px;
                    margin-bottom: 20px;
                }
                .materials-container {
                    margin-top: 40px;
                }
                table {
                    border-collapse: collapse;
                    width: 100%;
                }
                th, td {
                    border: 1px solid black;
                    padding: 5px;
                    text-align: left;
                }
                .grand-total {
                    font-size: 1.2em;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>Report</h1>`;

        // Group bath tables into pairs
        for (let i = 0; i < reportData.bathTables.length; i += 2) {
            htmlContent += `<div class="table-container">`;
            for (let j = i; j < i + 2 && j < reportData.bathTables.length; j++) {
                htmlContent += `<div><h2>${reportData.bathTables[j].sectionName}</h2><table>`;
                htmlContent += `<tr><th>Description</th><th>Area (Sq ft)</th></tr>`;
                reportData.bathTables[j].items.forEach(item => {
                    htmlContent += `<tr><td>${item.description}</td><td>${item.area}</td></tr>`;
                });
                htmlContent += `</table></div>`;
            }
            htmlContent += `</div>`;
        }

        // Materials table
        htmlContent += `<div class="materials-container"><h2>Materials</h2><table>`;
        htmlContent += `<tr><th>Description</th><th>Quantity</th><th>Units</th><th>Unit Price</th><th>Amount</th></tr>`;
        reportData.materialsTable.rows.forEach(item => {
            htmlContent += `<tr><td>${item.description}</td><td>${item.quantity}</td><td>${item.units}</td><td>${item.unitPrice}</td><td>${item.amount}</td></tr>`;
        });
        htmlContent += `</table></div>`;

        // Grand Total
        htmlContent += `<div class="grand-total">Grand Total: ${reportData.grandTotal}</div>`;

        htmlContent += `</body></html>`;


        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A2' });

        await browser.close();


        // Generate a unique filename
            const fileName = `report-${uuidv4()}.pdf`;

        // Upload the PDF to S3
        const s3Params = {
            Bucket: "screport-pdf",
            Key: fileName,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
            ACL: 'public-read'
        };

        s3.upload(s3Params, async (err, s3Data) => {
            if (err) {
                console.error('Error uploading to S3', err);
                return res.status(500).send('Error uploading to S3');
            }

            // SQL to update or insert the PDF URL in the database
            const updateSql = 'UPDATE HOMES SET oak_report_url = ? WHERE id = ?';
            connection.query(updateSql, [s3Data.Location, reportData.homeId], (updateErr, updateResult) => {
                    if (updateErr) {
                      throw new Error('Error updating database');
                    }

                    // Send the PDF in the response
                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                    res.send(pdfBuffer);
               });
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Error generating PDF');
    }
});

// ... [existing code] ...

// Update home details
app.put('/api/updatehome/:id', upload.single('file'), (req, res) => {
  const { id } = req.params;
  const { title, address } = req.body;
  let file = req.file;

  const updateDatabase = (pdfUrl = null) => {
    const sql = 'UPDATE HOMES SET home = ?, address = ?, pdf_url = ? WHERE id = ?';
    connection.query(sql, [title, address, pdfUrl || null, id], (dbErr, dbResult) => {
      if (dbErr) {
        console.error('Database error', dbErr);
        res.status(500).json({ success: false, message: 'Error updating data in the database' });
        return;
      }
      res.json({ success: true, message: 'Home updated successfully', data: dbResult });
    });
  };

  if (file && file.mimetype === 'application/pdf') {
    // If a new PDF is uploaded, handle the file upload to S3
    const s3Params = {
      Bucket: "vendor-pdf", // Replace with your bucket name
      Key: uploads/${Date.now()}_${file.originalname},
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    s3.upload(s3Params, (err, s3Data) => {
      if (err) {
        console.error('Error uploading to S3', err);
        res.status(500).json({ success: false, message: 'Error uploading file' });
        return;
      }

      // Update the database with new PDF URL
      updateDatabase(s3Data.Location);
    });
  } else {
    // If no new file is uploaded, update the database with existing data
    updateDatabase();
  }
});

app.delete('/api/homes/:homeId', (req, res) => {
  const { homeId } = req.params;

  // SQL query to delete the home
  const sql = 'DELETE FROM HOMES WHERE id = ?';

  connection.query(sql, [homeId], (err, result) => {
    if (err) {
      console.error('Database error', err);
      res.status(500).json({ success: false, message: 'Error deleting home from the database' });
      return;
    }

    // Check if any row was actually deleted
    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: 'Home not found' });
    } else {
      res.json({ success: true, message: 'Home deleted successfully' });
    }
  });
});





const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});