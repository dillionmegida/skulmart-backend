import sendMail from ".";

type SubscriptionExpiredArgs = {
  email: string;
  name: string;
  expDate: string;
  plan: string;
};
const subscriptionExpired = async ({
  email,
  name,
  expDate,
  plan,
}: SubscriptionExpiredArgs) => {
  const subject = `You subscription for ${plan} plan has expired : (`;
  const html = `
      <h2>Hi ${name} 👋</h2>
      <p>Thank you for trusting our platform this past month</p>
      <p>We are sending this email to inform you that
        your subscription has expired today (${expDate}).
      </p>
      <p>For this reason, all your products will be hidden from the
        public (but not deleted) and you won't have access to the 
        complete features of your dashboard until you subscribe again.
      </p>
      <br/>
      <p>If you have any difficulties using our platform, do
        not hestitate to contact us. We would be glad to help you
      </p>
    `;

  const mailResponse = await sendMail({
    html,
    receiver: email,
    subject,
  });

  if (mailResponse.err) {
    return {
      error: mailResponse.err,
    };
  }

  return {
    message: mailResponse.message,
  };
};

export default subscriptionExpired;
