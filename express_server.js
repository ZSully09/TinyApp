const express = require('express');
const app = express();
var cookieParser = require('cookie-parser');
const PORT = 8080; // default
const bodyParser = require('body-parser');

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

const urlDatabase = {
  // shortURL: 'longURL',
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
  '9an2ik': 'https://www.tsn.ca'
};

function generateRandomString() {
  let result = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get('/urls', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});
// let templateVars = {
//   username: req.cookies['username']
// };

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
// let templateVars = {
//   username: req.cookies['username']
// };
// , templateVars

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
});
// let templateVars = {
//   username: req.cookies['username']
// };

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get('/', (req, res) => {
//   res.send('Hello!');
// });

// app.get('/hello', (req, res) => {
//   let templateVars = { greeting: 'Hello World!' };
//   res.render('hello_world', templateVars);
// });

// app.get('/set', (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`);
// });

// a is not defined --> reference error
// app.get('/fetch', (req, res) => {
//   res.send(`a = ${a}`);
// });

// app.post('/urls', (req, res) => {
//   console.log(req.body);
//   res.send('Ok');
// });
