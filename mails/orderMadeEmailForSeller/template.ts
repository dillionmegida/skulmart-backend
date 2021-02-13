import { format } from "date-fns";
import chargeFee from "utils/chargeFee";
import { formatCurrency } from "utils/currency";
import { anchorLinkText } from "utils/strings";

type Args = {
  products: {
    name: string;
    quantity: number;
    price: number;
    confirm_order_url: string;
  }[];
  message: string;
  buyer: { name: string; phone: string };
};

export default function orderMadeForSeller({ buyer, products, message }: Args) {
  let totalPrice = 0;
  products.forEach((p) => (totalPrice += p.quantity * p.price));
  return `
  <div style='width: 100%; margin: auto;'>
  <h2 style='font-size: 20px;'>${buyer.name} purchased from you 🎉</h2>
  <p>on ${format(new Date(), "do LLL, yyyy")}</p>
  <p>Here are the details of the purchase:</p>
  <div>
    <ul>
      ${products
        .map(
          (i) =>
            `<li>
                <b>${i.name.toUpperCase()}</b> --- <b>${i.quantity}</b> qty(s)
                <br/>
                Paid: <b>${formatCurrency(i.price * i.quantity)}</b>
                <br/>
                <span style="font-size: 14px">
                    Confirm order received link (for buyer):
                    <span style='letter-spacing: 1px'>
                        ${anchorLinkText({
                          link: i.confirm_order_url,
                          text: i.confirm_order_url.replace("https://", ""),
                        })}
                    <span>
                </span>
            </li>`
        )
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
</div>
  `;
}
