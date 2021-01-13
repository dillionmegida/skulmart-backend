import { email } from "config/siteDetails";
import OrderInterface from "interfaces/OrderInterface";
import ProductInterface from "interfaces/Product";
import { formatCurrency } from "utils/currency";

type Args = {
  order: OrderInterface;
  product: ProductInterface;
  emailSubject: string;
  seller_rating: number;
  seller_review: string;
};

export default function ({
  order,
  emailSubject,
  product,
  seller_rating,
  seller_review,
}: Args) {
  const { quantity, price_when_bought } = order;
  const totalPaid = price_when_bought * quantity;
  return `
<div>
  <h2 style='font-size: 20px;'>${emailSubject}</h2>
  <div>
    Order info:
    <br/>
    <ul>
      <li>Name: <b>${product.name}</b></li>
      <li>Qty: <b>${quantity}</b></li>
      <li>Price (when bought): <b>${formatCurrency(price_when_bought)}</b></li>
    </ul>
  </div>
  <p>
    The buyer rated you <b>${seller_rating}</b> out of <b>5</b>.
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
    The money paid for this order is <b>${formatCurrency(totalPaid)}</b>. This will
    be refunded into the default bank account you provided in your
    dashboard. If you do not get the refund in the next 48 hours, please send
    us a mail at <a href="mailto:${email}">${email}</a>.
  </p>
</div>
  `;
}
