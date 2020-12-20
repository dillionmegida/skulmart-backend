const express = require("express");
const router = express.Router();

const EmailConfirmation = require("../../models/EmailConfirmation");
const Seller = require("../../models/Seller");
const Store = require("../../models/Store");
const welcomeEmail = require("../../mails/welcomeEmail");

const { FREE_PLAN } = require("../../constants/subscriptionTypes");

// @title GET request hash
// @desc update seller_id email confirm field to true with hash
// @access public

router.get("/:hash", async (req, res) => {
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
    const { shortname: storeName } = await Store.findById(
      confirmedSeller.store_id
    );

    if (typeOfEmailConfirmation === "welcome") {
      const sendEmailResponse = await welcomeEmail(
        confirmedSeller.email,
        confirmedSeller.fullname,
        storeName
      );

      if (sendEmailResponse.error) {
        // then the email didn't go successfully
        console.log(sendEmailResponse.error);
      }
    }

    // whether a welcome email is able to sent or not, redirect to email_confirmed
    // because seller email has already been confirmed
    res.json({
      redirectTo: `http://${storeName}.skulmart.com/email_confirmed?email=${confirmedSeller.email}`,
    });
  } else {
    res.json(400).json({
      error: "Could not verify email",
      message: "Seller's email address could not be verified",
    });
  }
});

module.exports = router;
