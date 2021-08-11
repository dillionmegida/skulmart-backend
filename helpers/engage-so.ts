import SellerInterface from "interfaces/Seller";
import Engage from "@engage_so/js";
import BuyerInterface from "interfaces/Buyer";
import { splitFullname } from "utils/strings";
import { getAcceptablePhoneNo } from "utils/phoneNo";

export function addEngageSeller(seller: SellerInterface, store: string) {
  Engage.identity({
    id: seller._id,
    email: seller.email,
    created_at: seller.createdAt,
    verified: "NONE",
    store,
  });
}

export function addEngageBuyer(buyer: BuyerInterface, store: string) {
  Engage.identity({
    id: buyer._id,
    email: buyer.email,
    created_at: buyer.createdAt,
    store,
  });
}

export function updateEngageSeller(seller: SellerInterface) {
  let first_name = "",
    last_name = "",
    number = "";

  if (seller.fullname) {
    const { first, last } = splitFullname(seller.fullname);

    first_name = first;
    last_name = last;
  }

  if (seller.whatsapp) number = getAcceptablePhoneNo(seller.whatsapp);

  Engage.addAttributes(seller._id, {
    first_name,
    last_name,
    brand_name: seller.brand_name || "",
    number,
    verified: seller.verified || "NONE",
    views_count: seller.views_count || 0,
    brand_category: seller.brand_category || "",
    visible: seller.visible || false,
  });
}

export function updateEngageBuyer(buyer: BuyerInterface) {
  let first_name = "",
    last_name = "",
    number = "";

  if (buyer.fullname) {
    const { first, last } = splitFullname(buyer.fullname);

    first_name = first;
    last_name = last;
  }

  if (buyer.phone) number = getAcceptablePhoneNo(buyer.phone);

  Engage.addAttributes(buyer._id, {
    first_name,
    last_name,
    number,
  });
}
