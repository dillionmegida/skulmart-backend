import { FREE_PLAN, SILVER_PLAN } from "constants/subscriptionTypes";
import Product from "models/Product";
import Seller from "models/Seller";
const paystackKey = process.env.PAYSTACK_SECRET_KEY;

//@ts-ignore
import _paystack from "paystack-api";
const paystack = _paystack(paystackKey);
export default async function subscriptionCallback(req: any, res: any) {
  const { reference } = req.query;

  try {
    const {
      status,
      data: {
        paid_at,
        customer: { email },
        metadata: { custom_fields },
      },
    } = await paystack.transaction.verify({ reference });

    if (status === false) {
      return res.json({
        message: "Transaction status is failed",
      });
    }

    const { subscription_type } = custom_fields[0];

    let plan = { ...FREE_PLAN };
    if (subscription_type === "silver") {
      plan = { ...SILVER_PLAN };
    }

    if (plan === null) {
      res.status(400).json({
        message: "Plan does not exist",
      });
      return;
    }

    const paidDate = new Date(paid_at);
    const endDate = new Date(paid_at).setMonth(paidDate.getMonth() + 1);

    let sellerId, subscriptionReference;

    const seller = req.user;
    if (seller) {
      // which is expected
      sellerId = seller._id;
      subscriptionReference = seller.subscription_reference;
    } else {
      // just in case
      const seller = await Seller.findOne({
        email,
      }).select("_id subscription_reference");

      if (seller === null) {
        res.redirect("https://google.com");
        return;
      }

      sellerId = seller._id;
      subscriptionReference = seller.subscription_reference;
    }

    if (reference === subscriptionReference) {
      // so that on refresh, this url does not reset
      // the subscription properties
      res.redirect("https://skulmart.com");
      return;
    }

    await Seller.findByIdAndUpdate(sellerId, {
      $set: {
        subscription_type: plan.name,
        subscription_start_date: paidDate,
        subscription_end_date: endDate,
        subscription_reference: reference,
      },
    });

    const idsOfProducts = await Product.find({
      seller: sellerId,
    })
      .limit(plan.max_products)
      .select("_id");

    const idsOfProductsToUpdate: string[] = [];

    idsOfProducts.forEach(({ _id }) => idsOfProductsToUpdate.push(_id));

    await Product.updateMany(
      { _id: { $in: idsOfProductsToUpdate } },
      {
        $set: {
          visible: true,
        },
      }
    );

    if (seller) {
      // then the seller is logged in
      // useful to redirect the seller to the store site
      const { store_name } = seller;
      res.redirect(
        `http://${store_name}.skulmart.com/dashboard?subscriptionStatus=success`
      );
    } else {
      // very unlikely
      res.redirect("http://skulmart.com");
    }
  } catch (err) {
    console.log("Unable to verify transaction reference because: ", err);
    return res.json({
      message: "Unable to verify transaction reference",
    });
  }
}
