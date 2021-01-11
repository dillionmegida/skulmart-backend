export const PRODUCTS_PER_PAGE = 20;
export const SELLERS_PER_PAGE = 20;

export const SERVER_URL = "http://skulmart-backend.herokuapp.com";

export const MAILGUN_EMAIL = "support@mg.skulmart.com";

export const CLOUDINARY_USER_IMAGES_FOLDER = process.env.IS_DEV
  ? "market-hub/testing"
  : "market-hub/user_images";
export const CLOUDINARY_PRODUCT_IMAGES_FOLDER = process.env.IS_DEV
  ? "market-hub/testing"
  : "market-hub/product_images";

export const links = {
  MERCHANT_SITE: "https://merchant.skulmart.com",
  SELLER_WHATSAPP_GROUP: "‎https://chat.whatsapp.com/G3tJXGTuY2hC5gar4J6L8V",
};

export const PAYSTACK_HOSTNAME = "https://api.paystack.co";

export const CALLBACK_URL_AFTER_INITIALIZING_TRANSACTION =
  SERVER_URL + "/api/buyers/transaction/complete";
