import verifyAccountNumber from "api/helpers/verifyAccountNumber";
import axios from "axios";
import chalk from "chalk";
import { PAYSTACK_HOSTNAME } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import OrderInterface from "interfaces/OrderInterface";
import ProductInterface from "interfaces/Product";
import SellerInterface from "interfaces/Seller";
import buyerHasReceivedOrder from "mails/buyerHasReceivedOrder";
import Order from "models/Order";
import Product from "models/Product";
import Seller from "models/Seller";
import addPaystackAuth from "utils/addPaystackAuth";

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

    res.json({
      message: "Order received successful",
    });

    // TODO: I may want to send this email using a webhook
    // or send here, and a webhook
    await buyerHasReceivedOrder({
      order,
      seller: seller,
      buyer: buyer,
      product,
      seller_rating: rating,
      seller_review: review,
    });

    // verify seller account number
    const sellerBank = seller.banks.find((a) => a._default === true);

    if (!sellerBank)
      throw new Error(
        chalk.red(
          "Seller does not have a default bank account for money transfer of a received order"
        )
      );

    const resolveSellerAcct = await verifyAccountNumber({
      account_number: sellerBank.account_number,
      bank_code: sellerBank.bank_code,
    });

    if (resolveSellerAcct.status === false)
      return res.status(400).json({
        message: "Bank account that seller provided is invalid",
      });

    const {
      data: { account_number: acctNumber, account_name: acctName },
    } = resolveSellerAcct;

    const amountToPayInKobo = parseInt(order.price_when_bought + "00", 10);

    // create transfer receipt
    const transferReceiptResponse = await axios({
      method: "post",
      url: PAYSTACK_HOSTNAME + "/transferrecipient",
      headers: {
        ...addPaystackAuth(),
      },
      data: {
        type: "nuban",
        bank_code: sellerBank.bank_code,
        account: acctNumber,
        name: sellerBank.account_name,
      },
    });

    if (transferReceiptResponse.data.status === false)
      throw new Error("Transfer receipt could not be created");

    const { recipient_code } = transferReceiptResponse.data.data;

    await Order.findByIdAndUpdate(order._id, {
      $set: {
        seller_receipt_code: recipient_code,
      },
    });

    // initiate transfer
    await axios({
      method: "post",
      url: PAYSTACK_HOSTNAME + "/transfer",
      headers: {
        ...addPaystackAuth(),
      },
      data: {
        source: "balance",
        amount: amountToPayInKobo,
        recipient: recipient_code,
        reason: "Transfer made after buyer confirmed Order " + order._id,
      },
    });
  } catch (err) {
    console.log(chalk.red("An error occured during receiving order >>> "), err);
    res.status(500).json({
      message: "An error occured. Please try again",
    });
  }
}
