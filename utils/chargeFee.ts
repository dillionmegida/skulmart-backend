export default function chargeFee(
  amount: number
): { total: number; fee: number; minusFee: number } {
  let fee = (1.5 / 100) * amount;

  if (amount >= 2500) {
    fee += 100;
  }

  const total = amount + fee;
  const minusFee = amount - fee;

  return { fee, total, minusFee };
}
