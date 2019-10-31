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

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'password'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'password2'
  }
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

// Look thru users object to pull an ID given an email and matching password
const findID = function(users, email) {
  for (const newID in users) {
    if (users[newID].email === email) {
      return users[newID];
    }
  }
  return false;
};

// Render the /urls page based on the urls_index HTML
app.get('/urls', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

// Render urls_registration for the registration page
app.get('/register', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('urls_registration', templateVars);
});

// Rending urls_login for the login page
app.get('/login', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.render('urls_login', templateVars);
});

// Render the /urls.json page in JSON format
app.get('/urls.json', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']]
  };
  res.json(urlDatabase, templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    user: users[req.cookies['user_id']]
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
    user: users[req.cookies['user_id']],
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

// Register a new user and add it to the users object
app.post('/register', (req, res) => {
  let newID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send('Email and password cannot be empty');
  }
  for (const userId in users) {
    if (users[userId].email === req.body.email) {
      return res.status(404).send('Email already associated to a User ID');
    }
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password
    };
  }
  // console.log(users);
  res.cookie('user_id', newID);
  res.redirect('/urls');
});

// Post login; confirm the email is in the user object; if not return 403; if so confirm passwords match, if they dont then return 403. After email and pw confirmation set the cookie to the users id
app.post('/login', (req, res) => {
  const user = findID(users, req.body.email);
  if (req.body.email !== user.email) {
    return res.status(403).send('Email not found');
  }
  if (req.body.password !== user.password) {
    return res.status(403).send('Password did not match');
  }
  // console.log(user);
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

// Logout and clear cookies for the user
app.post('/logout', (req, res) => {
  res.clearCookie('user_id', users[req.cookies['user_id']]);
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
