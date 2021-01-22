import { CHARGE_RATE } from "constants/index";

export default function chargeFee(
  amount: number
): { total: number; fee: number; minusFee: number } {
  let fee = CHARGE_RATE * amount;

  const total = amount + fee;
  const minusFee = amount - fee;

  return { fee, total, minusFee };
}
