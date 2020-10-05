const bcrypt = require("bcryptjs");

/**
 * Capitlize the first letter of a string containing one or more words
 * @param {string=} string to be capitalized
 * @returns {string} capitalized string
 */
const capitalize = (string) => {
  stringArr = string.split(" ");
  let captilized = "";
  stringArr.forEach(
    (word, index) =>
      // don't add text in before first word
      (captilized += `${index !== 0 ? " " : ""}${
        word.charAt(0).toUpperCase() + word.slice(1)
      }`)
  );
  return captilized;
};

// bycrypt doesn't return a promise, so I configured mine
function bcryptPromise(password) {
  return new Promise((resolve, reject) => {
    // Hash password using bcrypt
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  });
}

module.exports = { capitalize, bcryptPromise };
