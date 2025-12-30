const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); 

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dev123',
  database: 'cap' 
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to database.');
});

// Serve login.html when the server starts
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Registration Endpoint
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;

  // Insert new user with plain text password
  db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'User  registered successfully' });
  });
});

// Login Endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) {
      // User not found, suggest registration
      return res.status(400).json({ error: 'Please register first.' });
    }

    const user = results[0];

    // Check password (plain text comparison)
    if (user.email.endsWith('@admin.com') && password === '16102005') {
      // Admin login
      return res.status(200).json({ message: 'Login successful', role: 'admin' });
    } else if (user.password === password) {
      // Regular user login
      return res.status(200).json({ message: 'Login successful', role: 'user' });
    } else {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is stared`);
});