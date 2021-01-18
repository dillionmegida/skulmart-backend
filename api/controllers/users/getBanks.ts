import chalk from "chalk";
import getBanksApi from "api/helpers/getBanks";

export default async function getBanks(req: any, res: any) {
  try {
    const response = await getBanksApi();

    if (response.requestSuccessful === false)
      return res.status(400).json({
        message: "Banks could not be fetched",
      });

    res.json({ banks: response.responseBody });
  } catch (err) {
    console.log(
      chalk.red("An error occured during fetching of banks >> "),
      err
    );
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
