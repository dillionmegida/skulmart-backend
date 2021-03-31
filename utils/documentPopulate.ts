// some items should be hidden in document populations
// this file should handle all populates

type Populate = {
  path: string;
  select?: string;
  populate?: any;
};

type SelectArgs<Fields> = {
  remove?: Fields[];
};

type PopulateArgs<Fields> = {
  remove?: Fields[];
};

const joinRemoveSelectStr = (arr: string[]) =>
  arr.map((field) => "-" + field).join(" ");

// seller select and populate
export const storePopulate = () => ({
  path: "store",
});

// seller select and populate
type SellerFields = "banks" | "cards" | "password" | "views_devices" | "wallet";

export const selectSellerStr = ({ remove = [] }: SelectArgs<SellerFields>) =>
  joinRemoveSelectStr(["password", "views_devices", ...remove]);

export const sellerPopulate = ({
  remove,
}: PopulateArgs<SellerFields>): Populate => ({
  path: "seller",
  select: selectSellerStr({ remove: ["wallet", "cards", "banks"], ...remove }),
  populate: { ...storePopulate() },
});

// buyer select and populate
type BuyerFields = "banks" | "cards" | "password";

export const selectBuyerStr = ({ remove = [] }: SelectArgs<BuyerFields>) =>
  joinRemoveSelectStr(["password", ...remove]);
export const buyerPopulate = ({
  remove,
}: PopulateArgs<BuyerFields>): Populate => ({
  path: "buyer",
  select: selectBuyerStr({ remove: ["cards", "banks"], ...remove }),
});

// product select and populate
type ProductFields = "views_devices" | "cards" | "password";

export const selectProductStr = ({ remove = [] }: SelectArgs<ProductFields>) =>
  joinRemoveSelectStr(["views_devices", ...remove]);
export const productPopulate = ({
  remove,
}: PopulateArgs<ProductFields>): Populate => ({
  path: "product",
  select: selectProductStr({ remove }),
  populate: { ...storePopulate() },
});

// cart select and populate
export const negotiationPopulate = () => ({
  path: "negotiation",
});

// cart select and populate
export const cartPopulate = {
  path: "cart",
  populate: {
    ...productPopulate({}),
    populate: [{ ...sellerPopulate({}) }, { ...storePopulate() }],
  },
};

export const selectAdminStr = "-password";
