const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper function to check if a username is valid
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Helper function to check if username and password match
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });

    // Store accessToken in session
    req.session.authorization = { accessToken, username };

    return res.status(200).json({ message: "User successfully logged in." });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password." });
  }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.authorization?.username;

  // Check if user is authenticated
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  console.log("arrived here")
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Add or update the review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review successfully posted.", book: books[isbn] });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization?.username;

  // Check if user is authenticated
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Check if the user has a review for the book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user." });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review successfully deleted.", book: books[isbn] });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
