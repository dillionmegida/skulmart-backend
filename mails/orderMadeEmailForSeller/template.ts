import { formatCurrency } from "utils/currency";

type Args = {
  products: { name: string; quantity: number; price: number }[];
  message: string;
  buyer: { name: string; phone: string };
};

export default function orderMadeForSeller({
  buyer,
  products,
  message,
}: Args) {
  let totalPrice = 0;
  products.forEach((p) => (totalPrice += p.quantity * p.price));
  return `
  <div style='width: 100%; margin: auto;'>
  <h2 style='font-size: 20px;'>${buyer.name} purchased from you 🎉</h2>
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
    on how to deliver and recieve the orders.
  </p>
  <p>
    Remember that the earlier you call the buyer, the higher they rate you.
  </p>
</div>
  `;
}
