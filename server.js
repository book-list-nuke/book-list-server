'use strict';

// Application Dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const fs = require('fs');

//Application Setup
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(cors());

// API endpoints
// TODO: REMOVE THIS TEST ROUTE LATER. Auto deploy test
app.get('/test', (req, res) => res.send('hello hi!'));

// Endpoint to retreive an array of book objects from database
// TODO: ADD A $.GET TO BOOKS.JS TO LISTEN FOR THIS SEND(RESULTS.ROWS)
app.get('/api/v1/books', (req, res) => {
  client.query(`
    SELECT book_id, title, author, image_url, isbn
    FROM books;`)
    .then(results => res.send(results.rows))
    .catch(console.error)
});

app.get('*', (req, res) => res.redirect(CLIENT_URL));

loadDb();

// Starting a UNIX-Socket for connections on this port
app.listen(PORT, () => console.log(`listening on port: ${PORT}`));

function loadBooks() {
  fs.readFile('data/books.json', (err, fd) => {
    JSON.parse(fd.toString()).forEach(ele => {
      client.query(
        `INSERT INTO books
        (title, author, isbn, image_url, description)
        VALUES($1, $2, $3, $4, $5)
        ON CONFLICT (isbn) DO NOTHING;`,
        [ele.title, ele.author, ele.isbn, ele.image_url, ele.description]
      )
        .catch(console.error);
    })
  });
}

function loadDb() {
  client.query(`
    CREATE TABLE IF NOT EXISTS books(
      book_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      isbn VARCHAR(21) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      description TEXT
    );`)
    .then(loadBooks)
    .catch(console.error);
}
