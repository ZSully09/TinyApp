const express = require('express');
const app = express();
const PORT = 8080; // default

app.set('view engine', 'ejs');

const urlDatabase = {
  LHL: 'http://www.lighthouselabs.ca',
  Goog: 'http://www.google.com',
  TSN: 'https://www.tsn.ca'
};

app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render('hello_world', templateVars);
});

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get('/set', (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// a is not defined --> reference error
// app.get('/fetch', (req, res) => {
//   res.send(`a = ${a}`);
// });
