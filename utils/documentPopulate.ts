// some items should be hidden in document populations
// this file should handle all populates

export const storePopulate = {
  path: "store",
};

export const selectSellerStr = "-views_devices -password";
export const sellerPopulate = {
  path: "seller",
  select: selectSellerStr,
  populate: { ...storePopulate },
};

export const selectBuyerStr = "-password";
export const buyerPopulate = {
  path: "buyer",
  select: selectBuyerStr,
};

export const selectProductStr = "-views_devices";
export const productPopulate = {
  path: "product",
  select: selectProductStr,
  populate: { ...storePopulate },
};

export const cartPopulate = {
  path: "cart",
  populate: {
    ...productPopulate,
    populate: [{ ...sellerPopulate }, { ...storePopulate }],
  },
};

export const selectAdminStr = "-password";
