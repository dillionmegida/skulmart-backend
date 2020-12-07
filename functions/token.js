const jwt = require("jsonwebtoken");

const secret = process.env.SECRET_KEY;

const getToken = (obj) => jwt.sign({ ...obj }, secret);

const isTokenValid = (token) => {
  try {
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch {
    return false;
  }
};

const getTokenFromCookie = (req) => {
  const token = req.headers.authorization;
  return token;
};

module.exports = { getTokenFromCookie, isTokenValid, getToken };
