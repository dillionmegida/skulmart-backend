const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Seller = require("../../models/Seller");
const { getToken } = require("../../functions/token");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const getAuthUser = require("../../functions/getAuthUser");

// Log in seller
router.post("/login", async (req, res) => {
  let { usernameOrEmail, password } = req.body;

  usernameOrEmail = usernameOrEmail.trim();

  // Check if user exists
  const seller = await Seller.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });

  if (seller === null) {
    // then no seller exists with those credentials
    return res.status(400).json({
      message: "Username or password is incorrect",
    });
  }

  // compare passwords with bycrypt to see if they match
  const isMatch = await bcrypt.compare(password, seller.password);
  if (!isMatch) {
    // then they don't match
    return res.status(400).json({
      error: "Wrong credentials",
      message: "Username or password is incorrect",
    });
  }

  if (seller.email_confirm === false) {
    // then the seller hasn't confirmed email address
    return res.status(400).json({
      error: "Email not confirmed",
      message: `Please confirm your email address with the confirmation link sent to ${seller.email}`,
    });
  }

  const token = getToken({ _id: seller._id });

  return res.json({
    token,
    message: "Seller authenticated 👍",
  });
});

router.get("/me", isAuthenticated, async (req, res) => {
  res.json(getAuthUser(req));
});

module.exports = router;
