import mongoose from "mongoose";
import { ActivityType } from "interfaces/Activity";
import Activity from "models/Activity";

type Args =
  | {
      type: "ORDER_RECEIVED";
      options: {
        order_id: mongoose.Types.ObjectId;
        buyer_id: mongoose.Types.ObjectId;
        seller_id: mongoose.Types.ObjectId;
      };
    }
  | {
      type: "MONEY_WITHDRAWN";
      options: { withdraw_amount: number; seller_id: mongoose.Types.ObjectId };
    }
  | {
      type: "ORDER_REVIEWED";
      options: {
        order_id: mongoose.Types.ObjectId;
        buyer_id: mongoose.Types.ObjectId;
        seller_id: mongoose.Types.ObjectId;
      };
    }
  | {
      type: "PASSWORD_CHANGED";
      options: {
        who: "seller" | "buyer";
        user_id: mongoose.Types.ObjectId;
      };
    };

export async function saveActivity(args: Args) {
  if (args.type === "ORDER_RECEIVED" || args.type === "ORDER_REVIEWED") {
    const { seller_id, buyer_id, order_id } = args.options;
    return await new Activity({
      type: args.type,
      for_buyer: true,
      for_seller: true,
      order: order_id,
      buyer: buyer_id,
      seller: seller_id,
    }).save();
  }

  if (args.type === "MONEY_WITHDRAWN") {
    const { withdraw_amount, seller_id } = args.options;
    return await new Activity({
      type: args.type,
      seller: seller_id,
      options: {
        withdraw_amount,
      },
    }).save();
  }

  if (args.type === "PASSWORD_CHANGED") {
    const { who, user_id } = args.options;
    const activity = new Activity({
      type: args.type,
      for_buyer: who === "buyer",
      for_seller: who === "seller",
    });
    if (who === "buyer") {
      activity.buyer = user_id;
    }

    if (who === "seller") {
      activity.seller = user_id;
    }
    return await activity.save();
  }

  return;
}
