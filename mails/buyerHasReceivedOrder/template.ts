import { email } from "config/siteDetails";
import OrderInterface from "interfaces/OrderInterface";
import ProductInterface from "interfaces/Product";
import { formatCurrency } from "utils/currency";

type Args = {
  order: OrderInterface;
  product: ProductInterface;
  emailSubject: string;
  seller_rating: number;
};

export default function ({
  order,
  emailSubject,
  product,
  seller_rating,
}: Args) {
  const { seller_review, quantity, price_when_bought } = order;
  const totalPaid = price_when_bought * quantity;
  return `
<div>
  <h2 style='font-size: 20px;'>${emailSubject}</h2>
  <div>
    Order info:
    <br/>
    <ul>
      <li>Name: ${product.name}</li>
      <li>Qty: ${quantity}</li>
      <li>Price (when bought): ${formatCurrency(price_when_bought)}</li>
    </ul>
  </div>
  <p>
    The buyer rated you <b>${seller_rating} out of 5</b>.
    <br/>
  </p>
  ${
    seller_review && seller_review.length > 0
      ? `
    <p>
      They also sent a review:
      <br/>
      "${seller_review}"
    </p>
    `
      : ""
  }
  <p>
    Keep up the good work!
  </p>
  <p>
    The money paid for this order is ${formatCurrency(totalPaid)}. This will
    be refunded into the default bank account you provided in your
    dashboard. If you do not get the refund in the next 48 hours, please send
    us a mail @<a href="mailto:${email}">${email}</a>.
  </p>
</div>
  `;
}
