const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Seller = require("../../models/Seller");
const EmailConfirmation = require("../../models/EmailConfirmation");

// @title POST request seller
// @desc fetch all sellers from mongoose document
// @access public

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
    // they they don't match
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

  // console.log({seller})

  // setting a session of seller_id for the logged in seller
  req.session.seller_id = seller._id;
  console.log(req.session);

  return res.json({
    message: "Seller authenticated 👍",
  });
});

router.get("/me", async (req, res) => {
  if (!req.seller) return res.sendStatus(403);
  res.json(req.seller);
  // const seller = await Seller.findOne({ email: "dillionmegida@gmail.com" });
  // res.json(seller);
});

router.get("/isLoggedIn", (req, res) => {
  if (req.seller === null) {
    return res.status(403).json({
      isLoggedIn: false,
    });
  }

  return res.json({
    isLoggedIn: true,
  });
});

module.exports = router;
