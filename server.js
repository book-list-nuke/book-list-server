'use strict'

//These are our dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = require('body-parser').urlencoded({extended: true});

//Setting up our applications
const app = express();
const PORT = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:8080';

//Setting up our database
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client('postgres://localhost:5432/books_app');
client.connect();
client.on('error', err => console.error(err));

//Instantiating middleware
app.use(cors());

//Endpoints below here
//Test route
app.get('/test', (req, res) => res.send('This is a test route'))

//Getting stuff from the database to render on pages
app.get('/api/v1/books', (req, res) => {
  client.query(`SELECT * FROM books;`)
    .then(results => res.send(results.rows))
    .catch(console.error);
});

//This is a redirect
app.get('*', (req, res) => res.redirect(CLIENT_URL));

//This is supposed to add a new book to the database, but something isn't working either here or in the functions for it.
app.post('/api/v1/books', bodyParser, (req, res) => {
  console.log(req.body);
  let {title, author, isbn, image_url, description} = req.body;

  client.query(`
      INSERT INTO books(title, author, isbn, image_url, description) VALUES($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`,
    [title, author, isbn, image_url, description]
  )
    .then(res.sendStatus(201))
    .catch(console.error);
});

app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
