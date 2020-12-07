const express = require("express");
const router = express.Router();

const ResetPassword = require("../../models/ResetPassword");
const Seller = require("../../models/Seller");
const { bcryptPromise } = require("../../functions/strings");

router.get("/:hash", async (req, res) => {
  const hash = await ResetPassword.findOne({
    generatedHash: req.params.hash,
  });

  if (hash === null) {
    // then the hash does not exist
    return res.redirect("/");
  }

  const { store_name: storeName } = await Seller.findById(hash.seller_id);

  const { generatedHash } = hash;

  res.redirect(
    `http://${storeName}.skulmart.com/reset_password?hash=${generatedHash}`
  );
});

router.post("/:hash", async (req, res) => {
  const { password } = req.body;

  const hash = await ResetPassword.findOne({
    generatedHash: req.params.hash,
  });

  if (hash === null) {
    // just incase the hash is tampared with
    res.status(404).json({
      message:
        "This password link is not correct. Check your email and click Reset for the correct link",
    });
    return;
  }

  const seller = await Seller.findById(hash.seller_id);

  if (seller === null) {
    res.status(404).json({
      message: `Your account does not exist. Please contact support`,
    });
    return;
  }

  try {
    await ResetPassword.findByIdAndDelete(hash._id);
  } catch (err) {
    console.log("Password reset hash could not be deleted >> ", err);
  }

  const newPassword = await bcryptPromise(password);

  await Seller.findByIdAndUpdate(seller._id, {
    $set: {
      password: newPassword,
    },
  });

  res.json({
    message: "Password reset complete",
  });
});

module.exports = router;
