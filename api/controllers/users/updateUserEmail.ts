import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import confirmChangedEmail from "mails/confirmChangedEmail";
import Buyer from "models/Buyer";
import EmailConfirmation from "models/EmailConfirmation";
import Seller from "models/Seller";
import { randomNumber } from "utils/numbers";

export default async function updateUserEmail(req: any, res: any) {
  let { email, user_type } = req.body as {
    email: string;
    user_type: "seller" | "buyer";
  };

  email = email.trim();

  // check if user already exists
  const buyerWithSameEmail = await Buyer.findOne({ email });
  if (buyerWithSameEmail) {
    return res.status(400).json({
      message: `User with the email '${email}' already exists.`,
    });
  }

  const sellerWithSameEmail = await Seller.findOne({ email });
  if (sellerWithSameEmail) {
    return res.status(400).json({
      message: `User with the email '${email}' already exists.`,
    });
  }

  const userId = req.user._id;

  let existingUser: BuyerInterface | SellerInterface | null = null;

  if (user_type === "seller") {
    existingUser = await Seller.findOne({
      _id: userId,
    });
  } else if (user_type === "buyer") {
    existingUser = await Buyer.findOne({
      _id: userId,
    });
  }

  if (!existingUser)
    return res.status(400).json({
      message: "User not found",
    });

  if (user_type === "seller") {
    await Seller.findByIdAndUpdate(userId, {
      $set: {
        email,
        email_confirm: false,
      },
    });
  } else if (user_type === "buyer") {
    await Buyer.findByIdAndUpdate(userId, {
      $set: {
        email,
        email_confirm: false,
      },
    });
  }

  try {
    const generatedHash = randomNumber();

    const newEmailToBeConfirmed = new EmailConfirmation({
      generatedHash,
      user_id: userId,
      user_type,
    });

    await newEmailToBeConfirmed.save();

    const sendEmailResponse = await confirmChangedEmail({
      generatedHash,
      email,
      name: existingUser.fullname,
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        message:
          "Email changed Successfully 💛. Please check your email to confirm your new email address then login",
      });
    } else {
      // well the seller was still saved even if email wasn't sent
      console.log(
        chalk.red(
          "Email confirmation during changing email process could't be sent >> ",
          sendEmailResponse.error
        )
      );
    }
  } catch (err) {
    console.log(
      chalk.red("Error sending email during changing email process >> ", err)
    );
    res.status(400).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}