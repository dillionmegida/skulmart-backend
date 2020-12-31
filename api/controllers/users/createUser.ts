import chalk from "chalk";
import { CLOUDINARY_USER_IMAGES_FOLDER } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import emailConfirmation from "mails/emailConfirmation";
import Buyer from "models/Buyer";
import EmailConfirmation from "models/EmailConfirmation";
import Seller from "models/Seller";
import Store from "models/Store";
import { uploadImage } from "utils/image";
import { randomNumber } from "utils/numbers";
import { bcryptPromise, capitalize, replaceString } from "utils/strings";
import { getToken } from "utils/token";

export default async function createUser(req: any, res: any) {
  const body: SellerInterface | BuyerInterface = { ...req.body };

  const { email, store: store_id } = body;

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

    if (body.user_type === "seller") {
      const sellerWithSameUsername = await Seller.findOne({
        username: body.username,
      });

      // check if user already exists by username and email address
      if (sellerWithSameUsername) {
        // return if user exists
        return res.status(400).json({
          message: `Seller with username '${body.username}' already exists.`,
        });
      }
    }

    let user = null;

    const result = await uploadImage({
      path: req.file.path,
      filename: replaceString({
        str: body.fullname,
        replace: " ",
        _with: "-",
      }).toLowerCase(),
      folder: CLOUDINARY_USER_IMAGES_FOLDER,
    });

    if (result.error)
      return res.status(400).json({
        error: "Upload failed. Please try again",
      });

    const { public_id, url } = result;

    if (body.user_type === "buyer") {
      let { fullname, email, password } = body;

      // confirm formats of inputs
      fullname = capitalize(fullname.trim());
      email = email.trim();

      // create an object of the body entry
      const newBuyer = new Buyer({
        img: { public_id, url },
        fullname,
        email,
        password,
        store,
        store_name: shortname,
      });

      newBuyer.password = await bcryptPromise(newBuyer.password);

      await newBuyer.save();

      user = Object.create(newBuyer);
    } else if (body.user_type === "seller") {
      let {
        fullname,
        brand_name,
        username,
        brand_desc,
        whatsapp,
        email,
        password,
      } = body;

      // confirm formats of inputs
      fullname = capitalize(fullname.trim());
      brand_name = capitalize(brand_name.trim());
      // remove spaces - though this is handled in the client side already but just incase
      username = username.trim().replace(/\s/g, "").toLowerCase();
      email = email.trim();

      const newSeller = new Seller({
        img: { public_id, url },
        fullname,
        brand_name,
        username,
        brand_desc,
        whatsapp,
        email,
        password,
        store: store_id,
        store_name: shortname,
      });

      newSeller.password = await bcryptPromise(newSeller.password);

      await newSeller.save();

      user = Object.create(newSeller);
    }

    const generatedHash = randomNumber();

    const newEmailToBeConfirmed = new EmailConfirmation({
      generatedHash,
      // user_id would be sent with email, so that on verification, the email_confirm field would be true
      user_id: user._id,
      user_type: body.user_type,
    });

    await newEmailToBeConfirmed.save();

    const token = getToken({ _id: user._id });

    const sendEmailResponse = await emailConfirmation({
      generatedHash,
      email: user.email,
      name: user.fullname,
      store: shortname,
      user_type: body.user_type,
      type: "welcome",
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        token,
        message:
          "Account Created Successfully 💛. Please check your email to confirm your email address.",
      });
    } else {
      // well the seller was still saved even if email wasn't sent
      console.log(
        chalk.red(
          "Email confirmation couldn't be sent >> ",
          sendEmailResponse.error
        )
      );
    }
  } catch (err) {
    console.log(chalk.red("An error occured during user creation >> ", err));
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
