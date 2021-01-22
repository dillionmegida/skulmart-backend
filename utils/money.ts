export const convertToKobo = (amount: number) => {
  const [naira, kobo] = amount.toString().split(".");

  const amountToPayInKobo =
    kobo === undefined // the amount sent is just the naira format
      ? parseInt(naira, 10) * 100
      : kobo.length === 1 // the amount sent has kobo, but just 1 digit
      ? parseInt(naira, 10) * 10
      : amount;

  return amountToPayInKobo;
};
