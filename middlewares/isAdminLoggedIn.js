module.exports = function isAdminLoggedIn(req, res, next) {
  // seller is attached to req in server.js if seller is logged in

  if (req.session.admin_id === null || req.session.admin_id === undefined) {
    // admin is not logged in
    res.status(403).json({
      message: "Admin not authenticated",
    });
  } else next();
};
