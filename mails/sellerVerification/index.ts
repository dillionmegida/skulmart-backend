import { links } from "constants/index";
import SellerInterface from "interfaces/Seller";
import ValidationDocumentInterface from "interfaces/ValidationDocument";
import { formatDate } from "utils/dateFormatter";
import { anchorLinkText } from "utils/strings";
import sendMail from "..";

type Props =
  | {
      seller: SellerInterface;
      type: "success";
      validationDocument: ValidationDocumentInterface;
    }
  | {
      seller: SellerInterface;
      type: "error";
      message: string;
      validationDocument: ValidationDocumentInterface;
    };

export default async function sellerVerification({ ...args }: Props) {
  const subject =
    (args.type === "success"
      ? "Congratulations 🎉 Your account has been verified"
      : "There's a problem with your identification document ⚠️") +
    " (" +
    formatDate(new Date()) +
    ")";
  const html = `
<div style='width: 100%; margin: auto;'>
    <h2 style='font-size: 20px;'>${subject}</h2>
    <p>
        ${
          args.type === "success"
            ? `You can now log in to ${anchorLinkText({
                link: links.MERCHANT_SITE,
                text: "your dashboard",
              })} to start
            managing your products and your sales.`
            : `
                The document you submitted on ${formatDate(
                  args.validationDocument.createdAt
                )}
                has some errors
                <br/>
                ---
                <br/>
                ${args.message.replace("\n", "<br/>")}
            `
        }
    </p>
</div>
  `;

  const mailResponse = await sendMail({
    html,
    receiver: args.seller.email,
    subject,
  });

  if (mailResponse.err) {
    // then email couldn't send
    return {
      error: mailResponse.err,
    };
  }

  return {
    message: mailResponse.message,
  };
}
