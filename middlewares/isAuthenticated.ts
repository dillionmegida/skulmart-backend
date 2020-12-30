import { isTokenValid, getTokenFromCookie } from "utils/token";
import Seller from "models/Seller";
import SellerInterface from "interfaces/Seller";
import BuyerInterface from "interfaces/Buyer";
import Buyer from "models/Buyer";

export default async function isAuthTokenValid(req: any, res: any, next: any) {
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

    if (decoded.user_type === "buyer") {
      const buyer = await Buyer.findById(decoded._id)
        .select("-password")
        .populate({
          path: "cart",
          populate: {
            path: "product",
            populate: {
              path: "seller",
            },
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
