import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import OrderInterface from "interfaces/OrderInterface";
import ProductInterface from "interfaces/Product";
import SellerInterface from "interfaces/Seller";
import buyerHasReceivedOrder from "mails/buyerHasReceivedOrder";
import Order from "models/Order";
import Product from "models/Product";
import Seller from "models/Seller";

export default async function receivedOrder(req: any, res: any) {
  const buyer = req.user as BuyerInterface;
  const { id } = req.params;
  const { rating, review } = req.body as {
    rating: number;
    review: string;
  };

  try {
    const order = (await Order.findById(id)) as OrderInterface;
    const seller = (await Seller.findById(order.seller)) as SellerInterface;
    const product = (await Product.findById(order.product)) as ProductInterface;

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        has_buyer_received: true,
        seller_rating: rating,
        seller_review: review,
        buyer_received_date: new Date(),
      },
    });

    await Seller.findByIdAndUpdate(seller?._id, {
      $set: {
        ratings: seller?.ratings.concat(rating),
      },
    });

    await buyerHasReceivedOrder({
      order,
      seller: seller,
      buyer: buyer,
      product,
      seller_rating: rating,
      seller_review: review,
    });

    // TODO - send money to seller if seller has saved bank
    // else send email notifying seller to add that info, then he should contact us
    res.json({
      message: "Order received successful",
    });
  } catch (err) {
    console.log(chalk.red("An error occured during receiving order >>> "), err);
    res.status(500).json({
      message: "An error occured. Please try again",
    });
  }
}
