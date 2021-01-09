const paystackKey = process.env.PAYSTACK_TEST_SECRET_KEY;

export default function addPaystackAuth(): {
  authorization: string;
} {
  return {
    authorization: `Bearer ${paystackKey}`,
  };
}
