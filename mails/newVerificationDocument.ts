import { SITE_EMAIL } from "constants/index";
import { formatDate } from "utils/dateFormatter";
import sendMail from ".";

export default async function newVerificationDocument() {
  const subject =
    "A new verification document to be reviewed (" +
    formatDate(new Date()) +
    ")";

  const html = `
<div style='width: 100%; margin: auto;'>
    <h2 style='font-size: 20px;'>${subject}</h2>
    <p>
        You have a new document to verify. Kindly check your dashboard
    </p>
</div>
  `;

  const mailResponse = await sendMail({
    html,
    receiver: SITE_EMAIL,
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
