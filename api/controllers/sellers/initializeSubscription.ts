import { SILVER_PLAN } from "constants/subscriptionTypes";
const paystackKey = process.env.PAYSTACK_SECRET_KEY;

//@ts-ignore
import _paystack from "paystack-api";
const paystack = _paystack(paystackKey);

export default async function initializeSubscription(req: any, res: any) {
  const { subscriptionType } = req.query;

  let price;
  if (subscriptionType === "silver") price = SILVER_PLAN.price;
  else subscriptionType === "free";

  const helper = new paystack.FeeHelper();

  const amount = helper.addFeesTo(price);

  const seller = req.user;

  type PaystackResponse = {
    data: {
      authorization_url: string;
    };
  };

  paystack.transaction
    .initialize({
      amount,
      email: seller.email,
      metadata: {
        custom_fields: [{ subscription_type: subscriptionType }],
      },
    })
    .then(({ data: { authorization_url } }: PaystackResponse) =>
      res.redirect(authorization_url)
    );
}
