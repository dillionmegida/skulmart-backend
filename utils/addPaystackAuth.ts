const paystackKey = process.env.PAYSTACK_TEST_SECRET_KEY;

export default function addPaystackAuth() {
  return {
    authorization: `Bearer ${paystackKey}`,
  };
}
