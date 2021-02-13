import bcrypt from "bcryptjs";

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

// bycrypt doesn't return a promise, so here's a promisified type
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

type ReplaceStringArgs = {
  str: string;
  replace: string;
  _with: string;
};
export const replaceString = ({
  str,
  replace,
  _with,
}: ReplaceStringArgs): string => {
  const reg = new RegExp(replace, "g");
  return str.replace(reg, _with);
};

export const removeSpecialChars = (str: string) => str.replace(/\W|_/g, '')