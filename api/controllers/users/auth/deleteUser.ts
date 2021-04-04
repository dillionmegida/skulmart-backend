import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import Product from "models/Product";
import Seller from "models/Seller";
import { deleteImage } from "utils/image";
import bcrypt from "bcryptjs";
import Activity from "models/Activity";
import { formatCurrency } from "utils/currency";
import Order from "models/Order";
import Cart from "models/Cart";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function deleteUser(req: any, res: any) {
  const user = req.user as SellerInterface | BuyerInterface;

  try {
    allParametersExist(req.body, "email", "password");

    const { email, password } = req.body as { email: string; password: string };

    if (email !== user.email)
      return res.status(400).json({
        message: "Please enter your valid email",
      });

    if (user.user_type === "seller" && user.wallet.balance > 0)
      return res.status(400).json({
        message: `You currently have ${formatCurrency(
          user.wallet.balance
        )} in your wallet. Please contact us if you want to go ahead with the delete process.`,
      });

    let isPasswordMatch = false;

    if (user.user_type === "buyer") {
      const buyer = (await Buyer.findById(user._id)) as BuyerInterface;
      isPasswordMatch = await bcrypt.compare(password, buyer.password);
    } else {
      const seller = (await Seller.findById(user._id)) as SellerInterface;
      isPasswordMatch = await bcrypt.compare(password, seller.password);
    }

    if (!isPasswordMatch)
      return res.status(400).json({
        message: "Password is incorrect",
      });

    if (user.user_type === "buyer") {
      const pendingOrders = await Order.find({
        buyer: user._id,
        has_buyer_received: false,
      });

      if (pendingOrders.length > 0)
        return res.status(400).json({
          message:
            "You have pending orders. Please contact us if you want to go ahead with the delete process.",
        });

      await Cart.deleteMany({ buyer: user._id });

      await Buyer.deleteOne({
        _id: user._id,
      });
    } else {
      const pendingOrders = await Order.find({
        seller: user._id,
        has_buyer_received: false,
      });

      if (pendingOrders.length > 0)
        return res.status(400).json({
          message:
            "You have pending orders to attend to. Please contact us if you want to go ahead with the delete process.",
        });

      const products = await Product.find({ seller: user._id });

      // delete all seller's product documents
      await Product.deleteMany({
        seller: user._id,
      });

      // delete all seller's product images
      for (let i = 0; i < products.length; i++) {
        await deleteImage({
          public_id: products[i].img.public_id as string,
          errorMsg: "Could not delete product image during seller deletion",
        });
      }

      await Seller.deleteOne({
        _id: user._id,
      });
    }

    res.json({
      message: "Successfully deleted user",
    });

    if (
      (user.user_type === "buyer" && user.img.public_id) ||
      user.user_type === "seller"
    )
      await deleteImage({
        public_id: user.img.public_id as string,
        errorMsg: "Could not delete user image during user deletion",
      });

    // buyers and sellers share some activities,
    // so we need to ensure that only the unshared ones are deleted

    if (user.user_type === "seller")
      await Activity.deleteMany({ for_buyer: false, for_seller: true });

    if (user.user_type === "buyer")
      await Activity.deleteMany({ for_buyer: true, for_seller: false });
  } catch (err) {
    console.log("Could not delete user >> ", err);
    return res.status(400).json({
      error: err,
      message: "Problem occured. Please try again",
    });
  }
}
