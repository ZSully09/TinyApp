const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutputId = 'userRandomID';
    assert.equal(user.id, expectedOutputId);
  });

  it('should return a undefined with invalid email', function () {
    const user = getUserByEmail('u@example.com', testUsers);
    assert.equal(user, undefined);
  });

  it('should return a email with valid email', function () {
    const emailTest = 'user@example.com';
    const user = getUserByEmail(emailTest, testUsers);
    assert.equal(user.email, emailTest);
  });

  it('should return a password with valid email', function () {
    const user = getUserByEmail('user2@example.com', testUsers);
    const expectedOutputPassword = 'password2';
    assert.equal(user.password, expectedOutputPassword);
  });
});
