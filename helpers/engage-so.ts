import SellerInterface from "interfaces/Seller";
//@ts-ignore
import Engage from "@engage_so/js";
import BuyerInterface from "interfaces/Buyer";
import { splitFullname } from "utils/strings";
import { getAcceptablePhoneNo } from "utils/phoneNo";
import mongoose from "mongoose";

export function addEngageSeller(
  seller: SellerInterface,
  store: mongoose.Types.ObjectId
) {
  try {
    Engage.identity({
      email: seller.email,
      created_at: seller.createdAt,
      verified: "NONE",
      store,
    });
  } catch {}
}

export function addEngageBuyer(
  buyer: BuyerInterface,
  store: mongoose.Types.ObjectId
) {
  try {
    Engage.identity({
      email: buyer.email,
      created_at: buyer.createdAt,
      store,
    });
  } catch {}
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

  try {
    Engage.addAttributes(seller.email, {
      first_name,
      last_name,
      brand_name: seller.brand_name || "",
      number,
      verified: seller.verified || "NONE",
      views_count: seller.views_count || 0,
      brand_category: seller.brand_category || "",
      visible: seller.visible || false,
      email_confirm: seller.email_confirm || false,
    });
  } catch {}
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

  try {
    Engage.addAttributes(buyer.email, {
      first_name,
      last_name,
      number,
      email_confirm: buyer.email_confirm || false,
    });
  } catch {}
}
