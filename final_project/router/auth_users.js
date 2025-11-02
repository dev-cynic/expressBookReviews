const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// In-memory users store (username, password)
let users = [];

/** helpers for general.js to import */
const isValid = (username) => {
  if (!username) return false;
  return !users.find(u => u.username === username);
};
const authenticatedUser = (username, password) => {
  return users.find(u => u.username === username && u.password === password);
};

// ---------- Task 7: Login (POST /customer/login) ----------
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  const user = authenticatedUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { token, username };
  return res.status(200).json({ message: "Login successful", token });
});

// ---------- Task 8: Add/Modify review (PUT /customer/auth/review/:isbn?review=...) ----------
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session?.authorization?.username;

  if (!isbn) return res.status(400).json({ message: "ISBN is required" });
  if (!review) return res.status(400).json({ message: "Review text is required ?review=..." });
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (!book.reviews) book.reviews = {};
  // If user already reviewed, modify; else add
  const action = book.reviews[username] ? "modified" : "added";
  book.reviews[username] = review;
  return res.status(200).json({ message: `Review ${action} successfully`, reviews: book.reviews });
});

// ---------- Task 9: Delete own review (DELETE /customer/auth/review/:isbn) ----------
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session?.authorization?.username;

  if (!isbn) return res.status(400).json({ message: "ISBN is required" });
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Your review deleted", reviews: book.reviews });
  }
  return res.status(404).json({ message: "No review by this user for this ISBN" });
});

module.exports = {
  authenticated: regd_users,
  isValid,
  users
};
