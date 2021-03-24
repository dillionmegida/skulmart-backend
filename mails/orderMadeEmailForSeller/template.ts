import { format } from "date-fns";
import chargeFee from "utils/chargeFee";
import { formatCurrency } from "utils/currency";
import { anchorLinkText } from "utils/strings";

type Args = {
  orders: {
    name: string;
    quantity: number;
    buyer_desc: string;
    price: number;
    confirm_order_url: string;
    product: {
      quantity_available: number;
      delivery_fee: number;
    };
  }[];
  message: string;
  buyer: { name: string; phone: string };
};

export default function orderMadeForSeller({ buyer, orders, message }: Args) {
  let totalPrice = 0;
  orders.forEach((p) => {
    totalPrice += p.quantity * p.price;
    if (p.product.delivery_fee > 0) totalPrice += p.product.delivery_fee;
  });

  return `
  <div style='width: 100%; margin: auto;'>
  <h2 style='font-size: 20px;'>${buyer.name} purchased from you 🎉</h2>
  <p>on ${format(new Date(), "do LLL, yyyy")}</p>
  <p>Here are the details of the purchase:</p>
  <div>
    <ul>
      ${orders
        .map((i) => {
          const qtyProductsAvailable =
            i.product.quantity_available - i.quantity < 1
              ? 0
              : i.product.quantity_available - i.quantity;
          return `<li>
              <b>${i.name.toUpperCase()}</b> --- <b>${i.quantity}</b> qty(s)
              <br/>
              Paid: <b>${formatCurrency(i.price * i.quantity)}</b>
              <br/>
              Description from buyer: "<b>${i.buyer_desc}</b>"
              <br/>
              <span style="font-size: 15px">
                  Confirm order received link (for buyer):
                  <span style='letter-spacing: 1px'>
                      ${anchorLinkText({
                        link: i.confirm_order_url,
                        text: i.confirm_order_url.replace("https://", ""),
                      })}
                  </span>
              </span>
              <br/>
              <span style="font-size: 14px">
                You have ${qtyProductsAvailable} qty(s) of this product remaining.
              </span>
              <br/>
          </li>`;
        })
        .join("<br/>")}
    </ul>
    <p>Total price: <b>${formatCurrency(totalPrice)}</b></p>
    ${
      message && message.length > 0
        ? `<p>
            <b>The buyer sent a message:</b>
            <br/>
            "${message}"
          </p>`
        : ""
    }
  </div>
  <p>
    Kindly contact ${buyer.name} on <b>${buyer.phone}</b> to discuss
    the delivery process of the order.
    <br/>
    <br/>
    <b>Important:</b>
    <br/>
    On receiving their order, you can share the <b>Confirm order received link</b> (as seen in the orders above)
    with the buyer. On clicking the link, the buyer would be able to confirm that they have received the order.
    You will receive your money only when they confirm that they have received the order.
  </p>
  <p>
    When the buyer receives the order, you'll get <b>${formatCurrency(
      chargeFee(totalPrice).minusFee
    )}</b> added to your wallet.
  </p>
  <p>
    One last info, but not the least, <b>Remember</b> to increase the quantity of products you have in your
    dashboard. Only products with at least 1 quantity above will appear in the store.
  </p>
</div>
  `;
}
