import Buyer from "models/Buyer";
import Seller from "models/Seller";
import bcrypt from "bcryptjs";
import { getToken } from "utils/token";

export default async function loginUser(req: any, res: any) {
  let { usernameOrEmail, password, user_type } = req.body as {
    usernameOrEmail: string;
    password: string;
    user_type: "buyer" | "seller";
  };

  // this applies to seller online, as they can provide a username or an email
  usernameOrEmail = usernameOrEmail.trim();

  let user = null;

  if (user_type === "seller") {
    const seller = await Seller.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    user = seller && Object.create(seller);
  } else {
    const buyer = await Buyer.findOne({
      email: usernameOrEmail,
    });
    user = buyer && Object.create(buyer);
  }

  if (!user) {
    // then no user exists with those credentials
    return res.status(400).json({
      message: "Username or password is incorrect",
    });
  }

  // compare passwords with bycrypt to see if they match
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    // then they don't match
    return res.status(400).json({
      error: "Wrong credentials",
      message: "Username or password is incorrect",
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
}
