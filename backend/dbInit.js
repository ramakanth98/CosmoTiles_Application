const bcrypt = require('bcrypt');

// Function to initialize the database tables and insert default users
function initializeDb(connection) {
  // Use bcrypt to hash passwords
  const hashPassword = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  };

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      username VARCHAR(50) NOT NULL PRIMARY KEY,
      password VARCHAR(255) NOT NULL
    )`;

  const createHomesTable = `
    CREATE TABLE IF NOT EXISTS HOMES (
      id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
      home VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      pdf_url VARCHAR(255),
      screport_url VARCHAR(255),
      invoice_url VARCHAR(255)
    )`;

  // Initialize tables
  connection.query(createUsersTable, (userErr) => {
    if (userErr) throw userErr;
    console.log('Users table checked/created');

    // Insert default users with hashed passwords
    const insertDefaultUsers = `
      INSERT INTO users (username, password) VALUES
      ('test1', ?),
      ('test2', ?)
      ON DUPLICATE KEY UPDATE password = VALUES(password);
    `;
    connection.query(insertDefaultUsers, [hashPassword('pass1'), hashPassword('pass2')], (insertErr) => {
      if (insertErr) throw insertErr;
      console.log('Default users inserted/updated');
    });
  });

  // Initialize HOMES table
  connection.query(createHomesTable, (homeErr) => {
    if (homeErr) throw homeErr;
    console.log('HOMES table checked/created');
  });
}

module.exports = initializeDb;
