import sendMail from ".";

type SubscriptionWillSoonExpireArgs = {
  email: string;
  store: string;
  name: string;
  subDate: number;
  expDate: number;
  plan: string;
};
const subscriptionWillSoonExpire = async ({
  email,
  store,
  name,
  subDate,
  expDate,
  plan,
}: SubscriptionWillSoonExpireArgs): Promise<any> => {
  const diffDays = expDate - subDate;

  const subject = `You subscription for ${plan} will soon expire : (`;
  const html = `
      <h2>Hi ${name} 👋</h2>
      <p>We are sending this email to inform you that
        your subscription will soon expire. You subscribed on ${subDate} 
        which will expire on ${expDate} (<b>${diffDays} left</b>).
      </p>
      <p>Please note that, all your products will be hidden from the
        public (but not deleted) and you won't have access to the 
        complete features of your dashboard when your subscription expires.
      </p>
      <br/>
      <p>You can <a href='https://${store}.skulmart.com/subscription/renew'>renew your subscription</a> to continue enjoying our services.
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

export default subscriptionWillSoonExpire;
