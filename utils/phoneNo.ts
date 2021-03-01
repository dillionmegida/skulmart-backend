export const getAcceptablePhoneNo = (num: string): string => {
  return num.length === 11
    ? "234" + num.substr(1) // remove the first character "0" and prefix the number with 234
    : num;
};
