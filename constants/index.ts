import getAccessToken from "api/helpers/getAccessToken";
import btoa from "btoa";

export const PRODUCTS_PER_PAGE = 20;
export const SELLERS_PER_PAGE = 20;
export const ACTIVITY_PER_PAGE = 10;
export const ORDERS_PER_PAGE = 10;
export const REVIEWS_PER_PAGE = 20;

export const SITE_EMAIL = "support@skulmart.com";

export const SERVER_URL = "http://skulmart-backend.herokuapp.com";

export const MAILGUN_EMAIL = "support@mg.skulmart.com";

export const CLOUDINARY_USER_IMAGES_FOLDER = process.env.IS_DEV
  ? "market-hub/testing"
  : "market-hub/user_images";
export const CLOUDINARY_PRODUCT_IMAGES_FOLDER = process.env.IS_DEV
  ? "market-hub/testing"
  : "market-hub/product_images";
export const CLOUDINARY_USER_VERIFICATION_DOCUMENTS_FOLDER = process.env.IS_DEV
  ? "market-hub/testing"
  : "market-hub/user_verification_documents";

export const links = {
  MERCHANT_SITE: "https://merchant.skulmart.com",
  SELLER_WHATSAPP_GROUP: "‎https://chat.whatsapp.com/G3tJXGTuY2hC5gar4J6L8V",
};

export const PAYSTACK_KEY =
  //   process.env.NODE_ENV === "dev"
  // ? process.env.PAYSTACK_TEST_SECRET_KEY
  // :
  process.env.PAYSTACK_SECRET_KEY;

export const PAYSTACK_HOSTNAME = "https://api.paystack.co";
export const MONIFY_HOSTNAME = "https://sandbox.monnify.com/api/v1";
export const MONIFY_HOSTNAME_V2 = "https://sandbox.monnify.com/api/v2";

export const CALLBACK_URL_AFTER_ADDING_CARD =
  SERVER_URL + "/api/buyers/card/complete";

export const PAYSTACK_WEBHOOK = "/paystack-webhook";

export const env = process.env as {
  MONIFY_API_KEY: string;
  MONIFY_SECRET_KEY: string;
  MONIFY_ACCOUNT_NUMBER: string;
};

export const BASIC_AUTHORIZATION =
  "Basic " + btoa(env.MONIFY_API_KEY + ":" + env.MONIFY_SECRET_KEY);

export async function BEARER_TOKEN() {
  const auth = await getAccessToken();
  if (auth.requestSuccessful === false) return null;
  else return "Bearer " + auth.responseBody.accessToken;
}

export const CHARGE_RATE = 5 / 100;
export const MAX_FEE = 3000;

export const TERMII_SENDER_ID = "SkulMart";
export const TERMII_API_KEY = process.env.TERMII_API_KEY;
export const TERMII_API = "https://termii.com/api";
