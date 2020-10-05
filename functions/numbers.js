const randomNumber = () =>
  Math.floor(Math.random() * 1000000000000000).toString() +
  Math.floor(Math.random() * 1000000000000000).toString();

module.exports = { randomNumber };
