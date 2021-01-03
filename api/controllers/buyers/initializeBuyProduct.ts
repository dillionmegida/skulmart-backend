const paystackKey = process.env.PAYSTACK_TEST_SECRET_KEY;

//@ts-ignore
import _paystack from "paystack-api";
const paystack = _paystack(paystackKey);

export default async function initializeBuyProduct(req: any, res: any) {
  try {
    const res = await paystack.page.create({ name: "Products" });
    console.log({ res });
  } catch (err) {}
}
