import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";

export default async function completeTransaction(req: any, res: any) {
  const user = req.user as BuyerInterface | SellerInterface;
}
