import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import Buyer from "models/Buyer";
import Seller from "models/Seller";

export default async function removeAtmCard(req: any, res: any) {
  const { signature } = req.body as { signature: string };

  const user = req.user as BuyerInterface | SellerInterface;

  const existingCards = [...user.cards];

  const cardToBeRemoved = existingCards.findIndex(
    ({ signature: cardSignature }) => signature === cardSignature
  );

  if (cardToBeRemoved === -1)
    res.status(400).json({
      message: "Card to be removed not found",
    });

  existingCards.splice(cardToBeRemoved, 1);

  try {
    if (user.user_type === "buyer") {
      await Buyer.findByIdAndUpdate(user._id, {
        $set: {
          cards: [...existingCards],
        },
      });
    } else {
      await Seller.findByIdAndUpdate(user._id, {
        $set: {
          cards: [...existingCards],
        },
      });
    }
    res.json({ message: "Card removed successfully" });
  } catch (err) {
    console.log(chalk.red("An error occured during ATM card removal"), err);
  }
}
