import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import Product from "models/Product";
import Seller from "models/Seller";
import { deleteImage } from "utils/image";
import bcrypt from "bcryptjs";

export default async function deleteUser(req: any, res: any) {
  const { email, password } = req.body as { email: string; password: string };

  const user = req.user as SellerInterface | BuyerInterface;

  if (email !== user.email)
    return res.status(400).json({
      message: "Please enter your valid email",
    });

  try {
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
      await Buyer.deleteOne({
        _id: user._id,
      });
    } else {
      const products = await Product.find({ seller: user._id });

      // delete all seller's product documents
      await Product.deleteMany({
        seller_id: user._id,
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
  } catch (err) {
    console.log("Could not delete user >> ", err);
    return res.status(400).json({
      error: err,
      message: "Problem occured. Please try again",
    });
  }
}
