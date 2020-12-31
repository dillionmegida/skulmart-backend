import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import ResetPassword from "models/ResetPassword";
import Seller from "models/Seller";
import { bcryptPromise } from "utils/strings";

export default async function resetPassword(req: any, res: any) {
  const { password, user_type } = req.body as {
    password: string;
    user_type: "buyer" | "seller";
  };

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

  let user: BuyerInterface | SellerInterface | null = null;

  if (user_type === "buyer") {
    user = await Buyer.findById(hash.user_id);
  } else if (user_type === "seller") {
    user = await Seller.findById(hash.user_id);
  }

  if (!user) {
    res.status(404).json({
      message: `Your account does not exist. Please contact support`,
    });
    return;
  }

  try {
    await ResetPassword.findByIdAndDelete(hash._id);
  } catch (err) {
    console.log(chalk.red("Password reset hash could not be deleted >> ", err));
  }

  const newPassword = await bcryptPromise(password);

  if (user_type === "seller") {
    await Seller.findByIdAndUpdate(user._id, {
      $set: {
        password: newPassword,
      },
    });
  } else if (user_type === "buyer") {
    await Buyer.findByIdAndUpdate(user._id, {
      $set: {
        password: newPassword,
      },
    });
  }

  res.json({
    message: "Password reset complete",
  });
}
