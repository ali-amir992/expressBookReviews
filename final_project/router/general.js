const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if user already exists
  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  // Register the user
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can log in." });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  //Write your code here
  const ISBN = req.params.isbn;

  res.send(books[ISBN])
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  //Write your code here
  let ans = []
  for (const [key, values] of Object.entries(books)) {
    const book = Object.entries(values);
    for (let i = 0; i < book.length; i++) {
      if (book[i][0] == 'author' && book[i][1] == req.params.author) {
        ans.push(books[key]);
      }
    }
  }
  if (ans.length == 0) {
    return res.status(300).json({ message: "Author not found" });
  }
  res.send(ans);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  //Write your code here
  let ans = []
  for (const [key, values] of Object.entries(books)) {
    const book = Object.entries(values);
    for (let i = 0; i < book.length; i++) {
      if (book[i][0] == 'title' && book[i][1] == req.params.title) {
        ans.push(books[key]);
      }
    }
  }
  if (ans.length == 0) {
    return res.status(300).json({ message: "Title not found" });
  }
  res.send(ans);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const ISBN = req.params.isbn;
  res.send(books[ISBN].reviews)
});

// Task 10 
// Add the code for getting the list of books available in the shop (done in Task 1) using Promise callbacks or async-await with Axios

function getBookList() {
  return new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("No books available.");
    }
  });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bookList = await getBookList();
    res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    res.status(500).send(error);
  }
});


// Task 11
// Add the code for getting the book details based on ISBN (done in Task 2) using Promise callbacks or async-await with Axios.

function getFromISBN(isbn) {
  return new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(`No book found with ISBN: ${isbn}`);
    }
  });
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getFromISBN(isbn);
    res.status(200).send(JSON.stringify(book, null, 4));
  } catch (error) {
    res.status(404).send(error);
  }
});


// Task 12
// Add the code for getting the book details based on Author (done in Task 3) using Promise callbacks or async-await with Axios.

function getFromAuthor(author) {
  return new Promise((resolve, reject) => {
    const results = Object.values(books).filter(book => book.author === author);
    if (results.length > 0) {
      resolve(results);
    } else {
      reject(`No books found by author: ${author}`);
    }
  });
}

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const booksByAuthor = await getFromAuthor(author);
    res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
  } catch (error) {
    res.status(404).send(error);
  }
});

// Task 13
// Add the code for getting the book details based on Title (done in Task 4) using Promise callbacks or async-await with Axios.


function getFromTitle(title) {
  return new Promise((resolve, reject) => {
    const results = Object.values(books).filter(book => book.title === title);
    if (results.length > 0) {
      resolve(results);
    } else {
      reject(`No books found with title: ${title}`);
    }
  });
}

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const booksByTitle = await getFromTitle(title);
    res.status(200).send(JSON.stringify(booksByTitle, null, 4));
  } catch (error) {
    res.status(404).send(error);
  }
});


module.exports.general = public_users;