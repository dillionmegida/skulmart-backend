import chalk from "chalk";

type ConsoleMessageArgs = {
  message: string;
  type: "error";
  error: any;
};
export const consoleMessage = ({
  message,
  type,
  error,
}: ConsoleMessageArgs) => {
  if (type === "error") {
    console.log(chalk.red(message + " >>> "), error);
  }
};
