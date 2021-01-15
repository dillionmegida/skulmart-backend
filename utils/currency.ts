export const formatCurrency = (number: number) => {
  const formatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const result = formatter.format(number);
  const [naira, kobo] = result.split(".");

  if (kobo === "00") return naira;

  return result;
};

// this function depends on the output of formatCurrency
export function currencyToNumber(price: string) {
  const strOfNumbers = price.replace(/\D/g, ""); // remove every non-digits
  return parseInt(strOfNumbers);
}
