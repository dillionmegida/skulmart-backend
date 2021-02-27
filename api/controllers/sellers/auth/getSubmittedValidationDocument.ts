import chalk from "chalk";
import SellerInterface from "interfaces/Seller";
import ValidationDocument from "models/ValidationDocument";

export default async function getSubmittedValidationDocument(
  req: any,
  res: any
) {
  const seller = req.user as SellerInterface;

  try {
    const submittedDoc = await ValidationDocument.findOne({
      seller: seller._id,
    });

    res.json({
      document: submittedDoc,
    });
  } catch (err) {
    console.log(
      chalk.red("Could not get submitted validation document >> "),
      err
    );
    res.status(500).json({ message: "An error occured. Please try again" });
  }
}
