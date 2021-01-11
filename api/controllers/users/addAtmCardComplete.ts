import axios from "axios";
import chalk from "chalk";
import { email } from "config/siteDetails";
import { PAYSTACK_HOSTNAME } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import Card from "interfaces/Card";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import Seller from "models/Seller";
import addPaystackAuth from "utils/addPaystackAuth";

export default async function addAtmCardComplete(req: any, res: any) {
  const user = req.user as BuyerInterface | SellerInterface;

  const { reference } = req.body as { reference: string };

  try {
    const verifyRes = await axios({
      method: "get",
      url: PAYSTACK_HOSTNAME + "/transaction/verify/" + reference,
      headers: {
        ...addPaystackAuth(),
      },
    });
    if (!verifyRes.data.status)
      return res
        .status(400)
        .json(
          "Verification failed. If you have been debited, please send us an email @" +
            email
        );

    if (verifyRes.data.data.customer.email !== user.email)
      // just incase it's another user trying to verify charge
      return res
        .status(400)
        .json({ message: "Error occured. Please try again" });

    const authorization: Card = verifyRes.data.data.authorization;

    const doesCardExist =
      user.cards.findIndex(
        ({ signature }) => signature === authorization.signature
      ) !== -1;

    if (doesCardExist)
      return res
        .status(400)
        .json({ message: "This card has been saved alread" });

    if (user.user_type === "buyer") {
      await Buyer.findByIdAndUpdate(user._id, {
        $set: {
          cards: user.cards.concat(authorization),
        },
      });
    } else {
      await Seller.findByIdAndUpdate(user._id, {
        $set: {
          cards: user.cards.concat(authorization),
        },
      });
    }

    await axios({
      method: "post",
      url: PAYSTACK_HOSTNAME + "/refund",
      headers: {
        ...addPaystackAuth(),
      },
      data: {
        transaction: reference,
      },
    });

    res.json({
      authorization,
      message:
        "Card saved. Please contact @" +
        email +
        " if you do not see a refund in the next 48 hours",
    });
  } catch (err) {
    console.log(
      chalk.red("An error occured during atm card verification"),
      err
    );
    res.status(500).json({
      message: "An error occured. Please try again",
    });
  }
}
