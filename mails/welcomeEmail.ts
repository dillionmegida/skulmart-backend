import sendMail from ".";
import { siteName, twitter } from "config/siteDetails";
import { FREE_PLAN } from "constants/subscriptionTypes";
import { links } from "constants/index";
import { shareTwitter, shareWhatsApp } from "utils/socialMediaSharing";
import BuyerInterface from "interfaces/Buyer";
import SellerInterface from "interfaces/Seller";
import { getSellerProfileLink } from "utils/getLinks";

type SellerShareMessageArgs = {
  username: string;
  store: string;
};
const sellerShareMessage = ({ store, username }: SellerShareMessageArgs) =>
  "I am now managing my orders with " +
  store.toUpperCase() +
  " " +
  siteName +
  " (@" +
  twitter +
  ") !. Check out my profile here: " +
  getSellerProfileLink({ store, username: username });

type WelcomeEmailArgs = {
  email: string;
  profile: BuyerInterface | SellerInterface;
  store: string;
};
const welcomeEmail = async ({
  email,
  profile,
  store,
}: WelcomeEmailArgs): Promise<any> => {
  const subject = `Welcome to ${siteName}`;
  const html = `
        <div style='width: 100%; margin: auto'>
          <h2>Welcome ${profile.fullname} 🙌</h2>
          <p>Your email has been confirmed successfully.
            <br/>
            ${
              profile.user_type === "buyer"
                ? `You have registered as a buyer, and your default school store is ${store}. However you can
              buy products from any store of your choice. You can find the available stores in <a href='https://skulmart.com/stores'>this link</a>.`
                : `You have registered as a seller for ${store} store - <a href='http://${store}.skulmart.com'>${store}.skulmart.com</a>`
            }
          </p>
          <h3>Next Steps</h3>
          <p>
          ${
            profile.user_type === "buyer"
              ? `You can log into your account on any store to manage your transactions.
            Using your default store, sign in on <a href='https://${store}.skulmart.com/signin'>${store.toUpperCase()} Skulmart</a>
            so you can access your dashboard 🎉.`
              : `You have automatically received a free plan. This plan supports uploading a maximum of ${
                  FREE_PLAN.max_products
                } products.
            So, head over to <a href=${
              links.MERCHANT_SITE
            }>your dashboard</a> and start managing your products on ${siteName} 🎉.
            <br/><br/>
            You can also join the <a href="${
              links.SELLER_WHATSAPP_GROUP
            }">SkulMart Sellers WhatsApp Group</a> to get quick access to updates,
            suggest features, seek help, and also report issues.<br/><br/>
            Inform your contacts/followers on Twitter and Whatsapp that you now manage
            your products on ${siteName} by clicking the following links: 
            <a href="${shareTwitter(
              sellerShareMessage({
                store,
                username: profile.username,
              })
            )}">Share on Twitter</a> |
            <a href="${shareWhatsApp(
              sellerShareMessage({
                store,
                username: profile.username,
              })
            )}">Share on WhatsApp</a>`
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
