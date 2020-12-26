export const PRODUCTS_PER_PAGE = 20;
export const SELLERS_PER_PAGE = 20;

export const MAILGUN_EMAIL = "support@mg.skulmart.com";

export const CLOUDINARY_USER_IMAGES_FOLDER = process.env.IS_DEV
  ? "market-hub/testing"
  : "market-hub/user_images";
export const CLOUDINARY_PRODUCT_IMAGES_FOLDER = process.env.IS_DEV
  ? "market-hub/testing"
  : "market-hub/product_images";
