import sendMail from ".";
import { siteName } from "config/siteDetails";

type EmailConfirmationArgs = {
  generatedHash: string;
  email: string;
  store: string;
  type?: string;
  name: string;
};
const emailConfirmation = async ({
  generatedHash,
  email,
  name,
  store,
  type = "",
}: EmailConfirmationArgs) => {
  const subject = `Confirm your email address on ${siteName}`;
  const html = `
        <h2>Hi ${name} 👋</h2>
        <p>Please confirm your email address (${email}) which you used for ${store} store on ${siteName}.</p>
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
        <p style="margin-top: 30px; font-size: 14px">This email was sent to you because your email address was entered during a registration process @ ${siteName}. Ignore this email if it wasn't you.</p>
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
