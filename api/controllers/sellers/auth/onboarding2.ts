import chalk from "chalk";
import SellerInterface from "interfaces/Seller";
import welcomeEmail from "mails/welcomeEmail";
import Seller from "models/Seller";
import Store from "models/Store";
import { capitalize } from "utils/strings";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function onboarding2(req: any, res: any) {
  const user = req.user as SellerInterface;

  try {
    allParametersExist(
      req.body,
      "fullname",
      "whatsapp",
      "twitter",
      "instagram",
      "facebook"
    );

    const body: SellerInterface = { ...req.body };

    const {
      fullname: _fullname,
      whatsapp: _whatsapp,
      twitter: _twitter,
      instagram: _instagram,
      facebook: _facebook,
    } = body;

    const fullname = capitalize(_fullname.trim());
    const whatsapp = capitalize(_whatsapp.trim());
    const twitter = _twitter ? capitalize(_twitter.trim()) : "";
    const facebook = _facebook ? capitalize(_facebook.trim()) : "";
    const instagram = _instagram ? capitalize(_instagram.trim()) : "";

    const store = await Store.findById(user.store);

    if (!store)
      return res.status(400).json({
        message: "Selected store does not exist. Please contact support.",
      });

    await Seller.findByIdAndUpdate(user._id, {
      $set: {
        fullname,
        whatsapp,
        twitter,
        facebook,
        instagram,
        visible: true,
      },
    });

    const sendWelcomeEmailResponse = await welcomeEmail({
      email: user.email,
      profile: user,
      store: store.shortname,
    });

    if (sendWelcomeEmailResponse.error) {
      // then the email didn't go successfully
      console.log(chalk.red(sendWelcomeEmailResponse.error));
    }

    res.json({
      message: "Contact Information submitted successfully ✔",
    });
  } catch (err) {
    console.log(
      chalk.red("Error occuring during onboarding seller, stage 2 >> "),
      err
    );
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
