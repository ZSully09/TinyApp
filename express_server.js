// GLOBAL CONSTANTS
const { generateRandomString, getUserByEmail, urlsForUser } = require('./helpers.js');
const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;

//MIDDLEWARE
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 'session',
    keys: [
      /* secret key */
      'asdfghjkl'
    ]
  })
);

// DATABASES
const urlDatabase = {
  b2xVn2: { longURL: 'http://www.lighthouselabs.ca', userID: 'userRandomID' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'user2RandomID' },
  '9an2ik': { longURL: 'https://www.tsn.ca', userID: 'userRandomID' }
};

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

// Redirect from / to the users url page if logged in; redirect to login page if user is not logged in
app.get('/', (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect(`/urls`);
  }
  return res.redirect(`/login`);
});

// Render the urls_index HTML for the urls page if user is logged in; provide error notice with link to login or register pages if not logged in
app.get('/urls', (req, res) => {
  if (!users[req.session.user_id]) {
    // Could improve UX by auto redirect to login page
    return res.status(400).send('Please <a href="/login">login</a> to view your URLs. Alternatively, click <a href="/register">here</a> to register.');
  }
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id, urlDatabase)
  };
  res.render('urls_index', templateVars);
});

// Redirect from login to url if user is logged in; render urls_login for the login page if user not logged in
app.get('/login', (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect(`/urls`);
  }
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_login', templateVars);
});

// Redirect to urls page if user is logged in; render urls_registration for the registration page if user not logged in
app.get('/register', (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect(`/urls`);
  }
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_registration', templateVars);
});

// Render urls_new HTML for the /urls/new page if the user is logged in; redirect to login page if user not logged in
app.get('/urls/new', (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect(`/login`);
  }
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render('urls_new', templateVars);
});

// Render urls_show HTML for the /urls/:shortURL page if the user is logged in; provide error notice with link to login if not logged in or provide notice that the user is forbidden from viewing the url if the shortURL is not associated with their ID
app.get('/urls/:shortURL', (req, res) => {
  if (!users[req.session.user_id]) {
    return res.status(400).send('Please <a href="/login">login</a> to view your short URLs');
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send('You are forbidden from viewing this url.');
  }
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  res.render('urls_show', templateVars);
});

// Allows any user to redirect to the long url associated with a short URL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Post a new short url to the /urls page of a given user and redirect to the /urls/:shortURL page
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});


// Delete a url from the /urls page if the url is associated to the logged in users ID, and redirect back to the urls page; provide error notice if the url is not associated to their ID
app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send('You are forbidden from deleting this url');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// Edit a long url associated to a short url if the user ID is associated to the short url, and redirect to /urls page; provide error notice forbidding the user to edit the url if not associated with their user ID
app.post('/urls/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(403).send('You are forbidden from editing this url');
  }
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect('/urls');
});

// Generate a random ID for a new user and hash their inputted password, both to be stored in the users database. Redirect to /urls upon successful registration; provide applicable error message if the email and/or password were left empty or if the provided email is already associated to a user
app.post('/register', (req, res) => {
  let newID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Email and/or password cannot be empty');
  }
  for (const userId in users) {
    if (users[userId].email === req.body.email) {
      return res.status(400).send('Email already associated to a User ID');
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

// Confirm the inputted email associated to a user ID and the password matches the hased password associated to the ID, if successful redirect to the users /url page; if the inputted email is not associated to a user ID provide applicable error message, if the email is associated to a user ID but the password does not match provdie applicable error message
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

// Logout and clear cookies for the user and redirect to the /urls page (which will then redirect to login page)
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
