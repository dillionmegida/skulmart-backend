import BuyerActivity from "models/BuyerActivity";
import SellerActivity from "models/SellerActivity";
import mongoose from "mongoose";

type Args =
  | {
      type: "BUYER_RECEIVED_ORDER";
      options: {
        order_id: mongoose.Types.ObjectId;
        buyer_id: mongoose.Types.ObjectId;
        seller_id: mongoose.Types.ObjectId;
      };
    }
  | {
      type: "SELLER_WITHDRAW";
      options: { withdraw_amount: number; seller_id: mongoose.Types.ObjectId };
    }
  | {
      type: "BUYER_REVIEWED_ORDER";
      options: {
        order_id: mongoose.Types.ObjectId;
        buyer_id: mongoose.Types.ObjectId;
        seller_id: mongoose.Types.ObjectId;
      };
    };

export async function saveActivity(args: Args) {
  if (
    args.type === "BUYER_RECEIVED_ORDER" ||
    args.type === "BUYER_REVIEWED_ORDER"
  ) {
    const { seller_id, buyer_id, order_id } = args.options;
    await new SellerActivity({
      seller: seller_id,
      order: order_id,
      type: args.type,
    }).save();
    await new BuyerActivity({
      buyer: buyer_id,
      order: order_id,
      type: args.type,
    }).save();
    return;
  }

  if (args.type === "SELLER_WITHDRAW") {
    const { withdraw_amount, seller_id } = args.options;
    await new SellerActivity({
      seller: seller_id,
      options: {
        withdraw_amount,
      },
    }).save();
    return;
  }

  return;
}
