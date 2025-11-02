const express = require('express');
let books = require("./booksdb.js");
let { isValid, users } = require("./auth_users.js");
const axios = require("axios");

const public_users = express.Router();

/* ---------------- Tasks 1–5 (sync) ---------------- */

// Task 1: GET all books
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

// Task 2: GET book by ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

// Task 3: GET books by author
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const result = Object.keys(books)
    .filter(isbn => books[isbn].author.toLowerCase() === author.toLowerCase())
    .reduce((acc, isbn) => ({ ...acc, [isbn]: books[isbn] }), {});
  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "No books found for this author" });
  }
  return res.status(200).json(result);
});

// Task 4: GET books by title
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const result = Object.keys(books)
    .filter(isbn => books[isbn].title.toLowerCase() === title.toLowerCase())
    .reduce((acc, isbn) => ({ ...acc, [isbn]: books[isbn] }), {});
  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: "No books found for this title" });
  }
  return res.status(200).json(result);
});

// Task 5: GET reviews by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews || {});
});

/* ---------------- Task 6: Register ---------------- */

public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  // isValid returns true if username is AVAILABLE
  if (!isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

/* -------- Tasks 10–13 (Async/Await with Axios) --------
   These call our own endpoints via HTTP to demonstrate async patterns for the peer review screenshots.
*/

const BASE = "http://localhost:5000";

// Task 10: all books (async/await)
public_users.get('/axios/books', async (req, res) => {
  try {
    const { data } = await axios.get(`${BASE}/`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch books", error: String(e) });
  }
});

// Task 11: by ISBN (async/await)
public_users.get('/axios/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const { data } = await axios.get(`${BASE}/isbn/${isbn}`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch by ISBN", error: String(e) });
  }
});

// Task 12: by author (async/await)
public_users.get('/axios/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const { data } = await axios.get(`${BASE}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch by author", error: String(e) });
  }
});

// Task 13: by title (async/await)
public_users.get('/axios/title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const { data } = await axios.get(`${BASE}/title/${encodeURIComponent(title)}`);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ message: "Failed to fetch by title", error: String(e) });
  }
});

module.exports.general = public_users;
