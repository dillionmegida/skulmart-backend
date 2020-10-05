const sendMail = require("./index");
const { siteName } = require("../config/siteDetails");

const confirmChangedEmail = async (generatedHash, email, name) => {
  const subject = `Confirm your new email address on ${siteName}`;
  const html = `
        <h2>Hi ${name} 👋</h2>
        <p>Please confirm your new email address (${email}) to continue using ${siteName}
        </p>
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
            href='http://skulmart.com/confirm_email/${generatedHash}'
            title='Confirm email address on ${siteName}'
        >
            Confirm Email Address
        </a>
        <p style="margin-top: 30px; font-size: 14px">
          This email was sent to you because your email address was entered during a "Change Email Address"\
          process @ ${siteName}. Ignore this email if it wasn't you.
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
      error: err,
    };
  }

  return {
    message: mailResponse.message,
  };
};

module.exports = confirmChangedEmail;
