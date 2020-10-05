const sendMail = require("./index");
const { siteName } = require("../config/siteDetails");

const resetPassword = async (generatedHash, email, name, store) => {
  const subject = `Reset your password on ${siteName}`;
  const html = `
        <h2>Hi ${name} 👋</h2>
        <p>A password reset link was sent for your ${email} from ${store} store.<br/>
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
            href='https://${store}.skulmart.com/reset_password/${generatedHash}'
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
      error: err,
    };
  }

  return {
    message: mailResponse.message,
  };
};

module.exports = resetPassword;
