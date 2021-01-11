import axios from "axios";
import {
  CALLBACK_URL_AFTER_INITIALIZING_TRANSACTION,
  PAYSTACK_HOSTNAME,
} from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import addPaystackAuth from "utils/addPaystackAuth";

export default async function initializeTransaction(req: any, res: any) {
  const user = req.user as BuyerInterface | SellerInterface;

  const { amount } = req.body as { amount: number };
  try {
    const initializeRes = await axios({
      method: "POST",
      url: PAYSTACK_HOSTNAME + "/transaction/initialize",
      data: {
        amount,
        email: user.email,
        callback_url: CALLBACK_URL_AFTER_INITIALIZING_TRANSACTION,
      },
      headers: {
        ...addPaystackAuth(),
      },
    });
    res.json({
      payment_url: initializeRes.data.data.authorization_url,
    });
  } catch {}
}
