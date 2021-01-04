import sendMail from ".";
import { siteName } from "config/siteDetails";
import { links } from "constants/index";

type ResetPasswordEmailArgs = {
  generatedHash: string;
  email: string;
  name: string;
  store: string;
  user_type: "seller" | "buyer";
};
const resetPasswordEmail = async ({
  generatedHash,
  email,
  name,
  store,
  user_type,
}: ResetPasswordEmailArgs) => {
  const subject = `Reset your password on ${siteName}`;
  const resetLink =
    user_type === "seller"
      ? links.MERCHANT_SITE + "/reset-password?hash=" + generatedHash
      : `https://${store}.skulmart.com/reset-password?hash=${generatedHash}`;
  const html = `
        <h2>Hi ${name} 👋</h2>
        <p>A password reset link was sent for your email (${email}) from ${store} store.<br/>
        Click the button below to reset your password.</p>
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
            href='${resetLink}'
            title='Reset your password on ${siteName}'
        >
            Reset Password
        </a>
        <p style="margin-top: 30px; font-size: 14px">Ignore this email if this request didn't come from you.</p>
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

export default resetPasswordEmail;
