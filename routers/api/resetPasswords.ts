import express from "express";
const router = express.Router();

import ResetPassword from "models/ResetPassword";
import Seller from "models/Seller";
import { bcryptPromise } from "utils/strings";

router.get("/:hash", async (req: any, res: any) => {
  const hash = await ResetPassword.findOne({
    generatedHash: req.params.hash,
  });

  if (hash === null) {
    // then the hash does not exist
    return res.redirect("/");
  }

  const seller = await Seller.findById(hash.seller_id);

  if (!seller)
    return res.status(400).json({
      message: "No seller with that id",
    });

  const { generatedHash } = hash;

  res.redirect(
    `http://${seller.store_name}.skulmart.com/reset_password?hash=${generatedHash}`
  );
});

router.post("/:hash", async (req: any, res: any) => {
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

export default router;
