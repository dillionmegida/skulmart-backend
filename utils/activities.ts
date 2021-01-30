import { formatCurrency } from "./currency";

type Args =
  | { type: "BUYER_RECEIVED_ORDER"; options: { orderPrice: number } }
  | { type: "SELLER_WITHDRAW"; options: { withdrawAmount: number } };

export function getActivityMessage(args: Args) {
  let message = "";

  switch (args.type) {
    case "BUYER_RECEIVED_ORDER":
      const { orderPrice } = args.options;
      message: formatCurrency(orderPrice) + " was added to wallet";
      break;
  }

  return message;
}
