import bcrypt from "bcryptjs";
import { getToken } from "utils/token";
import Admin from "models/Admin";

export default async function loginAdmin(req: any, res: any) {
  let { email, password } = req.body as {
    email: string;
    password: string;
  };

  email = email.trim();

  const admin = await Admin.findOne({ email });

  if (!admin)
    return res.status(400).json({
      message: "Email or password is incorrect",
    });

  // compare passwords with bycrypt to see if they match
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch)
    // then they don't match
    return res.status(400).json({
      error: "Wrong credentials",
      message: "Email or password is incorrect",
    });

  const token = getToken({ _id: admin._id });

  return res.json({
    token,
    message: "Authenticated 👍",
  });
}
