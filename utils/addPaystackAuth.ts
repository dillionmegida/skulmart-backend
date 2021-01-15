import { PAYSTACK_KEY } from "constants/index";

export default function addPaystackAuth(): {
  authorization: string;
} {
  return {
    authorization: `Bearer ${PAYSTACK_KEY}`,
  };
}
