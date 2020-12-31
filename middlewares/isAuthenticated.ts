import { isTokenValid, getTokenFromCookie } from "utils/token";
import Seller from "models/Seller";
import SellerInterface from "interfaces/Seller";
import BuyerInterface from "interfaces/Buyer";
import Buyer from "models/Buyer";

export default async function isAuthenticated(req: any, res: any, next: any) {
  const token = getTokenFromCookie(req);

  const tokenString = token ? token.split(" ")[1] : undefined;

  if (!token || !tokenString)
    return res.status(401).json({ message: "Not logged in" });

  const decoded: { user_type: "buyer" | "seller"; _id: string } = isTokenValid(
    tokenString
  );
  if (!decoded) return res.status(401).json({ message: "Not logged in" });

  try {
    let user: SellerInterface | BuyerInterface | null = null;

    const { merchant = null } = req.headers;

    if (
      (decoded.user_type === "buyer" && merchant) ||
      // it means buyer has logged in before, but he's trying
      // to access the merchant dashboard
      (decoded.user_type === "seller" && !merchant)
      // it means seller has logged in before, but he's trying
      // to access a non-merchant dashboard
    ) {
      // un-auth them
      return next();
    }

    if (decoded.user_type === "buyer") {
      const buyer = await Buyer.findById(decoded._id)
        .select("-password")
        .populate({
          path: "cart",
          populate: {
            path: "product",
            populate: [{ path: "seller" }, { path: "store" }],
          },
        })
        .populate("store");
      user = buyer && Object.create(buyer);
    } else if (decoded.user_type === "seller") {
      const seller = await Seller.findById(decoded._id)
        .select("-password")
        .populate("store");
      user = seller && Object.create(seller);
    }

    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }
    req.user = Object.create(user);
    next();
  } catch {
    return res.status(401).json({ message: "Not logged in" });
  }
}
