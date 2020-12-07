const { isTokenValid, getTokenFromCookie } = require("../functions/token");
const Seller = require("../models/Seller");

module.exports = async function isAuthTokenValid(req, res, next) {
  const token = getTokenFromCookie(req);

  const tokenString = token ? token.split(" ")[1] : undefined;
  if (!token || !tokenString) {
    return res.status(401).json({ message: "auth token invalid" });
  }
  if (!token || !tokenString)
    return res.status(401).json({ message: "auth token invalid" });

  const decoded = isTokenValid(tokenString);
  if (!decoded) return res.status(401).json({ message: "auth token invalid" });

  try {
    const user = await Seller.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "auth token invalid" });
    }
    req.user = { ...user };
    next();
  } catch {
    return res.status(401).json({ message: "auth token invalid" });
  }
};
