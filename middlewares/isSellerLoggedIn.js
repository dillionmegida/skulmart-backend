module.exports = function isSellerLoggedIn(req, res, next) {
  // seller is attached to req in server.js if seller is logged in

  if (!req.seller)
    return res.status(400).json({
      message: "Not authenticated",
    });

  next();
};
