import bcrypt from "bcryptjs";

/**
 * Capitlize the first letter of a string containing one or more words
 * @param {string=} string to be capitalized
 * @returns {string} capitalized string
 */
export const capitalize = (str: string) => {
  const strArr = str.split(" ");
  let captilized = "";
  strArr.forEach(
    (word, index) =>
      // don't add text in before first word
      (captilized += `${index !== 0 ? " " : ""}${
        word.charAt(0).toUpperCase() + word.slice(1)
      }`)
  );
  return captilized;
};

// bycrypt doesn't return a promise, so I configured mine
export function bcryptPromise(password: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Hash password using bcrypt
    bcrypt.genSalt(10, (err: any, salt: any) => {
      bcrypt.hash(password, salt, (err: any, hash: string) => {
        if (err) return reject(err);
        resolve(hash);
      });
    });
  });
}
