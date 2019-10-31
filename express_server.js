const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
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

// Create function to randomize a new 6 character URL given a long URL
function generateRandomString() {
  let result = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Render the /urls page based on the urls_index HTML
app.get('/urls', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

// Render the /urls.json page in JSON format
app.get('/urls.json', (req, res) => {
  let templateVars = {
    username: req.cookies['username']
  };
  res.json(urlDatabase, templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    username: req.cookies['username']
  };
  res.render('urls_new', templateVars);
});

// Create New
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render('urls_show', templateVars);
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

// Post username to username cookie
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username', req.body.username);
  // req.session = null;
  res.redirect('/urls');
});

// Catch all
// app.get('*', (req, res) res.redirect())

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

// <h2> You are loggin is as <%= username %></h2>
