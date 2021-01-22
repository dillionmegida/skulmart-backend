import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import Seller from "models/Seller";

export default async function removeBankAccount(req: any, res: any) {
  const user = req.user as BuyerInterface | SellerInterface;

  const { account_number } = req.body as { account_number: string };

  try {
    const existingBanks = [...user.banks];

    const bankToBeRemoved = existingBanks.findIndex(
      ({ account_number: acctNumber }) => account_number === acctNumber
    );

    if (bankToBeRemoved === -1)
      return res
        .status(400)
        .json({ message: "The bank account to be removed is not found" });

    existingBanks.splice(bankToBeRemoved, 1);

    if (
      user.banks[bankToBeRemoved]._default === true && // if bank to be removed is the default
      existingBanks.length > 1 // and there are more than one bank available
    )
      existingBanks[0]._default = true; // make the next account true

    if (user.user_type === "buyer") {
      await Buyer.findByIdAndUpdate(user._id, {
        $set: {
          banks: [...existingBanks],
        },
      });
    } else {
      await Seller.findByIdAndUpdate(user._id, {
        $set: {
          banks: [...existingBanks],
        },
      });
    }

    res.json({
      message: "Bank account removed successfully",
    });
  } catch (err) {
    console.log(chalk.red("Error occured while removing bank account"), err);
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
