// Create function to randomize a new 6 character short URL given a long URL
function generateRandomString() {
  let result = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

/*
 * Look thru database to return the user from the database if the passed
 * email is the same as the email in the database
 */
const getUserByEmail = function (email, database) {
  for (const user in database) {
    // console.log('Another', database[user].email, email);
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

module.exports = { generateRandomString, getUserByEmail };

