import express from "express";
const router = express.Router();

import EmailConfirmation from "models/EmailConfirmation";
import Seller from "models/Seller";
import Store from "models/Store";
import welcomeEmail from "mails/welcomeEmail";

import { FREE_PLAN } from "constants/subscriptionTypes";

// @title GET request hash
// @desc update seller_id email confirm field to true with hash
// @access public

router.get("/:hash", async (req: any, res: any) => {
  const { type: typeOfEmailConfirmation = "" } = req.query;
  const hash = await EmailConfirmation.findOne({
    generatedHash: req.params.hash,
  });

  if (hash === null) {
    // then the hash does not exist
    return res.json({
      error: true,
      message: "Link has expired",
    });
  }

  const seller_id = hash.seller_id;

  const updateEmailStatus = await Seller.findByIdAndUpdate(seller_id, {
    $set: {
      email_confirm: true,
      subscription_type: FREE_PLAN.name,
    },
  });

  if (updateEmailStatus) {
    // then email has been confirmed
    // delete the hash collection from database
    try {
      await EmailConfirmation.findByIdAndDelete(hash._id);
    } catch (err) {
      console.log("Confirmed email hash could not be deleted >> ", err);
    }

    // get seller details
    const confirmedSeller = await Seller.findById(seller_id);

    if (!confirmedSeller)
      return res.status(404).json({ message: "Seller not found" });

    const store = await Store.findById(confirmedSeller.store_id);

    if (!store)
      return res.status(404).json({ message: "Store of seller not found" });

    if (typeOfEmailConfirmation === "welcome") {
      const sendEmailResponse = await welcomeEmail({
        email: confirmedSeller.email,
        name: confirmedSeller.fullname,
        store: store.shortname,
      });

      if (sendEmailResponse.error) {
        // then the email didn't go successfully
        console.log(sendEmailResponse.error);
      }
    }

    // whether a welcome email is able to sent or not, redirect to email_confirmed
    // because seller email has already been confirmed
    res.json({
      redirectTo: `http://${store.shortname}.skulmart.com/email_confirmed?email=${confirmedSeller.email}`,
    });
  } else {
    res.json(400).json({
      error: "Could not verify email",
      message: "Seller's email address could not be verified",
    });
  }
});

export default router;
