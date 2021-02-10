import chalk from "chalk";
import SellerInterface from "interfaces/Seller";
import Seller from "models/Seller";
import { capitalize } from "utils/strings";

export default async function onboarding2(req: any, res: any) {
  const user = req.user as SellerInterface;

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

  try {
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