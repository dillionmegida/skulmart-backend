import chalk from "chalk";

export const allParametersExist = (body: any, ...keys: string[]) => {
  keys.forEach((k) => {
    const value = body[k];
    if (value === undefined) {
      throw new Error(
        chalk.red(`\n\n"${k}" key is required in the body object by this API\n`)
      );
    }
  });
};
