import mongoose from "mongoose";
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
      options: { amount: number; seller_id: mongoose.Types.ObjectId };
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
    }
  | {
      type: "ORDERS_BOUGHT";
      options: {
        nOrders: number;
        ordersRef: string;
        buyer_id: mongoose.Types.ObjectId;
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
    const { amount, seller_id } = args.options;
    return await new Activity({
      type: args.type,
      seller: seller_id,
      for_buyer: false,
      for_seller: true,
      meta: {
        amount,
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

  if (args.type === "ORDERS_BOUGHT") {
    const { nOrders, ordersRef, buyer_id } = args.options;
    const activity = new Activity();
    activity.buyer = buyer_id;
    activity.type = args.type;
    activity.for_buyer = true;
    activity.for_seller = false;
    activity.meta = {
      ordersRef,
      nOrders,
    };

    return await activity.save();
  }

  return;
}
