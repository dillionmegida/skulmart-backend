import sendMail from ".";
import { siteName } from "config/siteDetails";
import { FREE_PLAN } from "constants/subscriptionTypes";

type WelcomeEmailArgs = { email: string; name: string; store: string };
const welcomeEmail = async ({
  email,
  name,
  store,
}: WelcomeEmailArgs): Promise<any> => {
  const subject = `Welcome to ${siteName}`;
  const html = `
        <div style='width: 100%; margin: auto'>
          <h2>Welcome ${name} 🙌</h2>
          <p>Your email has been confirmed successfully.
            <br/>
            You have registered for ${store} store - 
              <a href='http://${store}.skulmart.com'>${store}.skulmart.com</a>.
          </p>
          <h3>Next Steps</h3>
          <p>You have automatically received a free plan. This plan supports uploading a maximum of ${FREE_PLAN.max_products} products.
          So, head over to your dashboard and start managing your products on ${siteName} 🎉.</p>
        </div>
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

export default welcomeEmail;
