import { GroupedItemsPurchasedBySeller } from "interfaces/TransactionInterface";
import { formatCurrency } from "utils/currency";
import { getSellerProfileLink } from "utils/getLinks";

type Args = {
  items: GroupedItemsPurchasedBySeller;
  buyerPhone: string;
  pricePaid: number;
  message: string;
  emailSubject: string;
};

export default function transactionMadeForBuyer({
  items,
  pricePaid,
  buyerPhone,
  message,
  emailSubject,
}: Args) {
  const sellerUsernames = Object.keys(items);
  return `
<div>
  <h2 style='font-size: 20px;'>${emailSubject}</h2>
  <p>Here are the details of the purchase:</p>
  <div>
    ${sellerUsernames
      .map((username) => {
        const { seller_info, items: _items } = items[username];
        return `
          <span>From <a href="${getSellerProfileLink({
            username: seller_info.username,
            store: seller_info.store.shortname,
          })}" style='color: black; text-decoration: underline;'>
            ${seller_info.brand_name}</a>:
          </span>
          <br/>
          <ul>
            ${_items
              .map((i) => {
                return `
                <li>
                  <b>
                    ${i.product.name.toUpperCase()}
                  </b>
                  ---
                  <b>${i.quantity}</b> qty(s)
                  <br/>
                  Paid: <b>
                    ${formatCurrency(i.price_when_bought * i.quantity)}
                  </b>
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
      the number your provided <b>(${buyerPhone})</b>
      to discuss the delivery process.
      <br/>
      <br/>
      You can also send a WhatsApp message or email to the seller(s)
      to inform them of your purchase via the following:
      <ul>
      ${sellerUsernames
        .map((username) => {
          const { seller_info } = items[username];
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
