import { CHARGE_RATE, MAX_FEE } from "constants/index";

export default function chargeFee(
  amount: number
): { total: number; fee: number; minusFee: number } {
  const _fee = CHARGE_RATE * amount;

  const fee = _fee > MAX_FEE ? MAX_FEE : _fee; //fees capped at 3000

  const total = amount + fee;
  const minusFee = amount - fee;

  return { fee, total, minusFee };
}

export function chargeOnTransfer(amount: number): { fee: number } {
  let fee = 0;

  if (amount <= 5000) fee = 10;
  else if (amount <= 50000) fee = 25;
  else fee = 50;

  return { fee };
}
