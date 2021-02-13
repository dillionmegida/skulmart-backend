import mongoose from "mongoose";

export function getConfirmOrderReceivedLinkForBuyer({
  store,
  order_id,
}: {
  store: string;
  order_id: mongoose.Types.ObjectId;
}) {
  return (
    "https://" +
    store +
    ".skulmart.com/" +
    "customer/orders/confirm/" +
    order_id.toString()
  );
}
