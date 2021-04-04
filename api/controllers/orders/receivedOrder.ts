import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import OrderInterface from "interfaces/OrderInterface";
import ProductInterface from "interfaces/Product";
import SellerInterface from "interfaces/Seller";
import buyerHasReceivedOrder from "mails/buyerHasReceivedOrder";
import Order from "models/Order";
import Product from "models/Product";
import Seller from "models/Seller";
import { saveActivity } from "utils/activities";
import chargeFee from "utils/chargeFee";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function receivedOrder(req: any, res: any) {
  const buyer = req.user as BuyerInterface;

  try {
    allParametersExist(req.body, "rating", "review");

    const { id } = req.params;
    const { rating, review } = req.body as {
      rating: number;
      review: string;
    };

    const order = (await Order.findById(id)) as OrderInterface;
    const seller = (await Seller.findById(order.seller)) as SellerInterface;
    const product = (await Product.findById(order.product)) as ProductInterface;

    const totalPricePaid =
      order.price_when_bought * order.quantity + order.delivery_fee_when_bought;

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        has_buyer_received: true,
        seller_rating: rating,
        seller_review: review,
        buyer_received_date: new Date(),
      },
    });

    const priceSellerGets = chargeFee(totalPricePaid).minusFee;

    await Seller.findByIdAndUpdate(seller?._id, {
      $set: {
        ratings: seller?.ratings.concat({
          rating,
          buyer_id: buyer._id,
        }),
        wallet: {
          balance: seller.wallet.balance + priceSellerGets,
          last_income: new Date(),
        },
      },
    });

    res.json({
      message: "Order received successfully",
    });

    await buyerHasReceivedOrder({
      order,
      seller: seller,
      buyer: buyer,
      product,
      seller_rating: rating,
      seller_review: review,
    });

    await saveActivity({
      type: "ORDER_RECEIVED",
      options: {
        order_id: order._id,
        buyer_id: order.buyer,
        seller_id: order.seller,
      },
    });
  } catch (err) {
    console.log(chalk.red("An error occured during receiving order >>> "), err);
    res.status(500).json({
      message: "An error occured. Please try again",
    });
  }
}
