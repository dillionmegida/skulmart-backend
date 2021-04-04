import chalk from "chalk";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import StoreInterface from "interfaces/Store";
import emailConfirmation from "mails/emailConfirmation";
import Buyer from "models/Buyer";
import EmailConfirmation from "models/EmailConfirmation";
import Seller from "models/Seller";
import Store from "models/Store";
import { randomNumber } from "utils/numbers";
import { allParametersExist } from "utils/validateBodyParameters";

export default async function resendEmailConfirmationLink(req: any, res: any) {
  try {
    allParametersExist(req.body, "email", "user_type");

    let { email, user_type } = req.body as {
      email: string;
      user_type: "seller" | "buyer";
    };

    email = email.trim();

    let user: BuyerInterface | SellerInterface | null = null;

    if (user_type === "buyer") {
      user = await Buyer.findOne({ email });
    } else if (user_type === "seller") {
      user = await Seller.findOne({ email });
    }

    if (!user) {
      // then email does not exist
      return res.status(400).json({
        error: "Unable to find email",
        message: `'${email}' is not associated with an account`,
      });
    }

    if (user.email_confirm === true) {
      return res.json({
        message: "Your email address has been confirmed already",
      });
    }

    let existingEmailConfirmation = await EmailConfirmation.findOne({
      user_id: user._id as any,
    });

    // incase the emailConfirmation document was not saved in the db during registration

    if (existingEmailConfirmation === null) {
      // then an email confirmation document was not saved for this email, which is almost never possible
      const generatedHash = randomNumber();
      const newEmailToBeConfirmed = new EmailConfirmation({
        generatedHash,
        user_id: user._id,
        user_type,
      });
      await newEmailToBeConfirmed.save();

      existingEmailConfirmation = newEmailToBeConfirmed;
    }

    const { shortname } = (await Store.findById(user.store)) as StoreInterface;

    const sendEmailResponse = await emailConfirmation({
      generatedHash: existingEmailConfirmation?.generatedHash,
      email: user.email,
      name: user.fullname,
      store: shortname,
      user_type,
    });

    if (!sendEmailResponse.error) {
      // then the email went successfully
      res.json({
        message:
          "Confirmation link sent 💛. Please check your email to confirm your email address then login",
      });
    } else {
      console.log(
        chalk.red(
          "Email confirmation could't be sent >> ",
          sendEmailResponse.error
        )
      );
    }
  } catch (err) {
    console.log(
      chalk.red("An error occured while resending confirmation link >> ", err)
    );
    res.status(500).json({
      error: err,
      message: "Error occured. Please try again",
    });
  }
}
