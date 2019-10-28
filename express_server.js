const express = require('express');
const app = express();
const PORT = 8080; // default

app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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

app.get('/set', (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

// a is not defined --> reference error
app.get('/fetch', (req, res) => {
  res.send(`a = ${a}`);
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
