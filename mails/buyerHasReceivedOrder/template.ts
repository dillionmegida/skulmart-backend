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
  const { quantity, price_when_bought, _id } = order;
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
    ----------
  </p>
  <p>
    Keep up the good work!
  </p>
  <p>
    The money paid for this order is <b>${formatCurrency(
      totalPaid
    )}</b>. This will
    be refunded into the default bank account you provided in your
    dashboard.
    <br/>
    <br/>
    If you haven't provided one yet, please send us an email at <a href="mailto:${email}">${email}</a>
    with the subject <b>"No bank account to receive the refund for this order - ${_id}"</b> so that we can resolve it
    immediately.
    <br/>
    <br/>
    If you have an account, but do not get the refund in the next 24 hours, please email us.
  </p>
</div>
  `;
}
