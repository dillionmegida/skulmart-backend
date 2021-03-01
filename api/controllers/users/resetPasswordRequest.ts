import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import StoreInterface from "interfaces/Store";
import resetPasswordEmail from "mails/resetPasswordEmail";
import Buyer from "models/Buyer";
import ResetPassword from "models/ResetPassword";
import Seller from "models/Seller";
import Store from "models/Store";
import { randomNumber } from "utils/numbers";

export default async function resetPasswordRequest(req: any, res: any) {
  let { email, user_type } = req.body as {
    email: string;
    user_type: "buyer" | "seller";
  };

  email = email.trim();

  let user: BuyerInterface | SellerInterface | null = null;

  if (user_type === "buyer") {
    user = await Buyer.findOne({ email });
  } else if (user_type === "seller") {
    user = await Seller.findOne({ email });
  }

  try {
    if (!user) {
      // then email does not exist
      return res.status(400).json({
        error: "Unable to find email",
        message: `'${email}' is not associated with an account`,
      });
    }

    const existingResetPassword = await ResetPassword.findOne({
      user_id: user._id,
    });

    let hash;

    if (existingResetPassword === null) {
      const generatedHash = randomNumber();
      const newPasswordReset = new ResetPassword({
        generatedHash,
        user_id: user._id,
      });

      await newPasswordReset.save();

      hash = generatedHash;
    }
    // then a password reset document was saved already
    else hash = existingResetPassword.generatedHash;

    const { shortname } = (await Store.findById(user.store)) as StoreInterface;

    const sendEmailResponse = await resetPasswordEmail({
      generatedHash: hash,
      email,
      name: user.fullname,
      store: shortname,
      user_type,
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        message:
          "Password reset link sent 💛. Please check your email to reset your password",
      });
    } else {
      console.log(
        chalk.red("Password reset could't be sent >> ", sendEmailResponse.error)
      );
    }
  } catch (err) {
    console.log(
      chalk.red("An error occured while send password reset link >> ", err)
    );
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
