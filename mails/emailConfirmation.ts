import sendMail from ".";
import { siteName } from "config/siteDetails";

type EmailConfirmationArgs = {
  generatedHash: string;
  email: string;
  store: string;
  name?: string | null;
  type?: "welcome" | "";
  user_type: "buyer" | "seller";
};
const emailConfirmation = async ({
  generatedHash,
  email,
  name = null,
  store,
  type = "",
  user_type,
}: EmailConfirmationArgs) => {
  const subject = `Confirm your email address on ${siteName}`;
  const html = `
        <h2>Hi ${name ?? "there"} 👋</h2>
        <p>Please confirm your email address (${email})
          which you used when registering as a 
          ${user_type} ${
    user_type === "seller" ? "for " + store + " store " : ""
  }
          on ${siteName}.</p>
        <a
            style='
            margin: 5px 0;
            text-align: center;
            display: block;
            padding: 10px;
            background-color: rgb(18, 122, 61);
            color: white;
            border-radius: 5px;
            width: 100%;
            margin: 0 auto;
            font-size: 16px;
            text-decoration: none;
            '
            href='http://skulmart.com/confirm_email/${generatedHash}?type=${type}'
            title='Confirm email address on ${siteName}'
        >
            Confirm Email Address
        </a>
        <p>-----</p>
        <p>
            Remember to always keep an eye on your emails for
            notifications on transactions, updates or anything : )</p>
        <p style="margin-top: 30px; font-size: 13px">
            This email was sent to you because your email address
            was entered during a registration process at ${siteName}.
            Kindly ignore this email if it wasn't you.
        </p>
    `;

  const mailResponse = await sendMail({
    html,
    receiver: email,
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
};

export default emailConfirmation;
