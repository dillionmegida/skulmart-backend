import { GroupedOrdersPurchasedFromSeller } from "interfaces/OrderInterface";
import { formatCurrency } from "utils/currency";
import { getSellerProfileLink } from "utils/getLinks";
import mongoose from "mongoose";
import { anchorLinkText } from "utils/strings";

type Args = {
  orders: GroupedOrdersPurchasedFromSeller;
  buyerPhone: string;
  pricePaid: number;
  message: string;
  emailSubject: string;
  confirmOrderLinks: { _id: mongoose.Types.ObjectId; url: string }[];
};

export default function orderMadeForBuyer({
  orders,
  pricePaid,
  buyerPhone,
  message,
  emailSubject,
  confirmOrderLinks,
}: Args) {
  const sellerUsernames = Object.keys(orders);
  return `
<div>
  <h2 style='font-size: 20px;'>${emailSubject}</h2>
  <p>Here are the details of the purchase:</p>
  <div>
    ${sellerUsernames
      .map((username) => {
        const { seller_info, orders: _orders } = orders[username];
        return `
          <span>From <a href="${getSellerProfileLink({
            username: seller_info.username,
            store: seller_info.store.shortname,
          })}" style='color: black; text-decoration: underline;'>
            ${seller_info.brand_name}</a>:
          </span>
          <br/>
          <ul>
            ${_orders
              .map((i) => {
                return `
                <li>
                  <b>
                    ${i.product_populated.name.toUpperCase()}
                  </b>
                  ---
                  <b>${i.quantity}</b> qty(s)
                  <br/>
                  Paid: <b>
                    ${formatCurrency(
                      (i.negotiated_price
                        ? i.negotiated_price
                        : i.price_when_bought) * i.quantity
                    )}
                  </b>
                  <br/>
                  ${
                    i.buyer_desc &&
                    i.buyer_desc.length > 0 &&
                    `Your description: "<b>${i.buyer_desc}</b>"
                      <br/>
                      `
                  }
                  ${anchorLinkText({
                    link: (confirmOrderLinks.find(
                      ({ _id }) => _id.toString() === i._id.toString()
                    ) as { url: string }).url,
                    text: "Confirm order received",
                  })}
                </li>
              `;
              })
              .join("<br/>")}
          </ul> 
          `;
      })
      .join("<br/>")}
    <p>Total price: <b>${formatCurrency(pricePaid)}</b></p>
    ${
      message && message.length > 0
        ? `
      <p>
        <b>You sent a message:</b>
        <br/>
        "${message}"
      </p>`
        : ""
    }
    </div>
    <p>
      The seller(s) of the product(s) you've purchased will contact you on
     your number <b>(${buyerPhone})</b>
      to discuss the delivery process.
      <br/>
      <br/>
      You can also send a WhatsApp message or email to the seller(s)
      to inform them of your purchase via the following:
      <ul>
      ${sellerUsernames
        .map((username) => {
          const { seller_info } = orders[username];
          return `
            <li>
              ${seller_info.brand_name}
              <br/>
              Name: ${seller_info.fullname}
              <br/>
              Email: ${seller_info.email}
              <br/>
              WhatsApp: ${seller_info.whatsapp}
            </li>
          `;
        })
        .join("<br/>")}
      </ul>
    </p>
</div>
  `;
}
