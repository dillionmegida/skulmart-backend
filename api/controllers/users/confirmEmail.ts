import chalk from "chalk";
import { links } from "constants/index";
import { FREE_PLAN } from "constants/subscriptionTypes";
import { updateEngageBuyer, updateEngageSeller } from "helpers/engage-so";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import EmailConfirmation from "models/EmailConfirmation";
import Product from "models/Product";
import Seller from "models/Seller";
import Store from "models/Store";

export default async function confirmEmail(req: any, res: any) {
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

  const { user_id, user_type } = hash;

  let updateEmailStatus = null;

  if (user_type === "buyer") {
    updateEmailStatus = await Buyer.findByIdAndUpdate(user_id, {
      $set: {
        email_confirm: true,
      },
    });

    if (updateEmailStatus) updateEngageBuyer(updateEmailStatus);
  } else if (user_type === "seller") {
    updateEmailStatus = await Seller.findByIdAndUpdate(user_id, {
      $set: {
        email_confirm: true,
        subscription_type: FREE_PLAN.name,
      },
    });

    if (updateEmailStatus) updateEngageSeller(updateEmailStatus);

    // after verification, all seller's views should be visible
    // TODO if a new plan comes out, that prolly supports more products, remember to
    // conditionally update visible true of products depending on what the plan supports
    await Product.updateMany(
      { seller: updateEmailStatus?._id },
      {
        $set: {
          visible: true,
        },
      }
    );
  }

  if (updateEmailStatus) {
    // then email has been confirmed
    // delete the hash collection from database
    try {
      await EmailConfirmation.findByIdAndDelete(hash._id);
    } catch (err) {
      console.log(
        chalk.red("Confirmed email hash could not be deleted >> ", err)
      );
    }

    // get user details
    let confirmedUser = null;

    if (user_type === "seller") {
      confirmedUser = await Seller.findById(user_id);
    } else if (user_type === "buyer") {
      confirmedUser = await Buyer.findById(user_id);
    }

    if (!confirmedUser)
      return res.status(404).json({ message: "User not found" });

    const store = await Store.findById(confirmedUser.store);

    if (!store)
      return res.status(404).json({ message: "Store of user not found" });

    const emailConfirmedLink =
      user_type === "seller"
        ? links.MERCHANT_SITE + "/email-confirmed?email=" + confirmedUser.email
        : `http://${store.shortname}.skulmart.com/email-confirmed?email=${confirmedUser.email}`;

    // whether a welcome email is able to be sent or not, redirect to email_confirmed
    // because seller email has already been confirmed
    res.json({
      redirectTo: emailConfirmedLink,
    });
  } else {
    res.json(400).json({
      error: "Could not verify email",
      message: "User's email address could not be verified",
    });
  }
}
