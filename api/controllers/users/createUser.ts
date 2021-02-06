import chalk from "chalk";
import { CLOUDINARY_USER_IMAGES_FOLDER } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import emailConfirmation from "mails/emailConfirmation";
import Buyer from "models/Buyer";
import EmailConfirmation from "models/EmailConfirmation";
import Seller from "models/Seller";
import Store from "models/Store";
import shortid from "shortid";
import { uploadImage } from "utils/image";
import { randomNumber } from "utils/numbers";
import { bcryptPromise, capitalize, replaceString } from "utils/strings";
import { getToken } from "utils/token";

export default async function createUser(req: any, res: any) {
  const body: SellerInterface | BuyerInterface = { ...req.body };

  const { email: _email, store: store_id, password, user_type } = body;

  const email = _email.trim();

  try {
    const store = await Store.findOne({
      _id: store_id,
    });

    if (!store)
      return res.status(400).json({
        message: "Store does not exist",
      });

    const { shortname } = store;

    // check if user already exists
    const buyer = await Buyer.findOne({ email });
    if (buyer) {
      // return if user exists
      return res.status(400).json({
        message: `User with email '${email}' already exists.`,
      });
    }

    const seller = await Seller.findOne({ email });
    if (seller) {
      // return if user exists
      return res.status(400).json({
        message: `User with email '${email}' already exists.`,
      });
    }

    const encryptedPassword = await bcryptPromise(password);

    let newUser: SellerInterface | BuyerInterface | null = null;

    if (user_type === "seller") {
      newUser = new Seller({
        email,
        password: encryptedPassword,
        store: store_id,
        username: shortid.generate(),
      });
      await newUser.save();
    } else {
      newUser = new Buyer({
        email,
        password: encryptedPassword,
        store: store_id,
      });
      await newUser.save();
    }

    if (!newUser)
      return res
        .status(400)
        .json({ message: "An error occured. Please try again." });

    const generatedHash = randomNumber();

    const newEmailToBeConfirmed = new EmailConfirmation({
      generatedHash,
      // user_id would be sent with email, so that on verification, the email_confirm field would be true
      user_id: newUser._id,
      user_type,
    });

    await newEmailToBeConfirmed.save();

    const token = getToken({ _id: newUser._id });

    const sendEmailResponse = await emailConfirmation({
      generatedHash,
      email: newUser.email,
      store: shortname,
      user_type,
      type: "welcome",
    });

    res.json({
      token,
      message:
        "Account Created Successfully 💛. Please check your email to confirm your email address.",
    });

    if (sendEmailResponse.error) {
      console.log(
        chalk.red(
          "Email confirmation couldn't be sent >> ",
          sendEmailResponse.error
        )
      );
    }
  } catch (err) {
    console.log(chalk.red("An error occured during user creation >> "), err);
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
