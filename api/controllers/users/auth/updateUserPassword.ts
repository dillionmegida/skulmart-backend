import bcrypt from "bcryptjs";
import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import Seller from "models/Seller";
import { saveActivity } from "utils/activities";
import { bcryptPromise } from "utils/strings";

export default async function updateUserPassword(req: any, res: any) {
  const body = { ...req.body } as {
    old_password: string;
    new_password: string;
    user_type: "seller" | "buyer";
  };

  const { old_password, new_password, user_type } = body;

  const authUser = req.user;

  let user: BuyerInterface | SellerInterface | null = null;

  if (user_type === "seller") {
    user = await Seller.findOne({
      _id: authUser._id,
    });
  } else if (user_type === "buyer") {
    user = await Buyer.findOne({
      _id: authUser._id,
    });
  }

  if (!user)
    return res.status(400).json({
      message: "User not found",
    });

  // compare old password
  const isMatch = await bcrypt.compare(old_password, user.password);
  if (!isMatch) {
    // they they don't match
    return res.status(400).json({
      error: "Wrong credentials",
      message: "Old password is incorrect",
    });
  }
  try {
    const encryptedPassword = await bcryptPromise(new_password);

    if (user_type === "seller") {
      await Seller.findByIdAndUpdate(user._id, {
        $set: {
          password: encryptedPassword,
        },
      });
    } else if (user_type === "buyer") {
      await Buyer.findByIdAndUpdate(user._id, {
        $set: {
          password: encryptedPassword,
        },
      });
    }

    res.json({
      message: "Successfully updated password",
    });

    await saveActivity({
      type: "PASSWORD_CHANGED",
      options: {
        who: user_type,
        user_id: authUser._id,
      },
    });
  } catch (err) {
    console.log(
      chalk.red("Error occurred during password update process >> "),
      err
    );
    res.status(400).json({
      error: err,
      message: "Error occured! Please try again.",
    });
  }
}
