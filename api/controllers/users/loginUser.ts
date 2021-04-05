import Buyer from "models/Buyer";
import Seller from "models/Seller";
import bcrypt from "bcryptjs";
import { getToken } from "utils/token";
import { consoleMessage } from "utils/logs";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function loginUser(req: any, res: any) {
  try {
    allParametersExist(req.body, "email", "password", "user_type");

    let { email, password, user_type } = req.body as {
      email: string;
      password: string;
      user_type: "buyer" | "seller";
    };

    email = email.trim();

    let user = null;

    if (user_type === "seller") {
      const seller = await Seller.findOne({
        email,
      });
      user = seller && Object.create(seller);
    } else {
      const buyer = await Buyer.findOne({
        email,
      });
      user = buyer && Object.create(buyer);
    }

    if (!user) {
      // then no user exists with those credentials
      return res.status(400).json({
        message: "Email or password is incorrect",
      });
    }

    // compare passwords with bycrypt to see if they match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // then they don't match
      return res.status(400).json({
        error: "Wrong credentials",
        message: "Email or password is incorrect",
      });
    }

    if (user.email_confirm === false) {
      // then the user hasn't confirmed email address
      return res.status(400).json({
        error: "Email not confirmed",
        message: `Please confirm your email address with the confirmation link sent to ${user.email}`,
      });
    }

    const token = getToken({ _id: user._id, user_type });

    return res.json({
      token,
      message: "Authenticated 👍",
    });
  } catch (err) {
    consoleMessage({
      message: "An error occured during user login",
      error: err,
      type: "error",
    });
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
