import sendMail from ".";
import { siteName } from "config/siteDetails";
import { FREE_PLAN } from "constants/subscriptionTypes";

type WelcomeEmailArgs = {
  email: string;
  name: string;
  store: string;
  user_type: "seller" | "buyer";
};
const welcomeEmail = async ({
  email,
  name,
  store,
  user_type,
}: WelcomeEmailArgs): Promise<any> => {
  const subject = `Welcome to ${siteName}`;
  const html = `
        <div style='width: 100%; margin: auto'>
          <h2>Welcome ${name} 🙌</h2>
          <p>Your email has been confirmed successfully.
            <br/>
            ${
              user_type === "buyer"
                ? `You have registered as a buyer, and your default school store is ${store}. However you can
              buy products from any store of your choice. You can find the available stores in <a href='https://skulmart.com/stores'>this link</a>.`
                : `You have registered as a seller for ${store} store - <a href='http://${store}.skulmart.com'>${store}.skulmart.com</a>`
            }
          </p>
          <h3>Next Steps</h3>
          <p>
          ${
            user_type === "buyer"
              ? `You can log into your account on any store to manage your transactions.
            Using your default store, sign in on <a href='https://${store}.skulmart.com/signin'>${store.toUpperCase()} Skulmart</a>
            so you can access your dashboard 🎉.`
              : `You have automatically received a free plan. This plan supports uploading a maximum of ${FREE_PLAN.max_products} products.
            So, head over to <a href='https://merchant.skulmart.com'>your dashboard</a> and start managing your products on ${siteName} 🎉.`
          }</p>
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
