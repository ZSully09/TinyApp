const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers.js');
const express = require('express');
const app = express();
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const PORT = 8080; // default
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

//MIDDLEWARE
app.set('view engine', 'ejs');
//app.use(cookieParser());
app.use(
  cookieSession({
    name: 'session',
    keys: [
      /* secret keys */
      'asdfghjkl'
    ]
  })
);
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  // shortURL: 'longURL',
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
  '9an2ik': { longURL: 'https://www.tsn.ca', userID: 'userRandomID' }
};

// User database including password hashing
const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('password', 10)
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('password2', 10)
  }
};

// 
app.get('/', (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect(`/urls`);
  }
  return res.redirect(`/login`);
});

// Render the /urls page based on the urls_index HTML
app.get('/urls', (req, res) => {
  if (!users[req.session.user_id]) {
    // Poor UX; should auto redirect to login page
    return res.status(400).send('Please <a href="/login">login</a> to view your URLs. Alternatively, click <a href="/register">here</a> to register.');
  }
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render('urls_index', templateVars);
});

// Rending urls_login for the login page
app.get('/login', (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect(`/urls`);
  }
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});

// Render urls_registration for the registration page
app.get('/register', (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect(`/urls`);
  }
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_registration', templateVars);
});

// Render the /urls.json page in JSON format
app.get('/urls.json', (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.json(urlDatabase, templateVars);
});

app.get('/urls/new', (req, res) => {
  // if the user is undefined redirect to the login page
  if (!users[req.session.user_id]) {
    return res.redirect(`/login`);
  }
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_new', templateVars);
});

// Create New
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

// Edit
app.get('/urls/:shortURL', (req, res) => {
  if (!users[req.session.user_id]) {
    return res.status(400).send('Please <a href="/login">login</a> to view your short URLs');
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send('You are forbidden from editing this url.');
  }
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  // console.log('split');
  // console.log(urlDatabase);
  res.render('urls_show', templateVars);
});

// Redirecting to the long url given the short url is provided
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Delete
app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.redirect('/urls');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Post for edit
app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send('You are forbidden from editing this url');
  }
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

// Register a new user and add it to the users object with assigned newID
app.post('/register', (req, res) => {
  let newID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Email and/or password cannot be empty');
  }
  for (const userId in users) {
    if (users[userId].email === req.body.email) {
      return res.status(404).send('Email already associated to a User ID');
    }
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: hashedPassword
    };
  }
  req.session.user_id = newID;
  res.redirect('/urls');
});

// Post login; confirm the email is in the user object; if not return 403; if so confirm passwords match, if they dont then return 403. After email and pw confirmation set the cookie to the users id
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (user === undefined || req.body.email !== user.email) {
    return res.status(403).send('User details not found');
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send('Password did not match');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});

// Logout and clear cookies for the user
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
