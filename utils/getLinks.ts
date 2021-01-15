type GetSellerProfileLinkArgs = {
  username: string;
  store: string;
};
export const getSellerProfileLink = ({
  username,
  store,
}: GetSellerProfileLinkArgs) =>
  `https://${store}.skulmart.com/sellers/${username}`;
