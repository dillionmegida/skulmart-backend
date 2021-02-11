import SellerNotificationMessage from "models/SellerNotificationMessage";

export default async function getNotifications(req: any, res: any) {
  const allNotifications = await SellerNotificationMessage.find();

  const sellerId = req.user._id;
  const unreadNotifications = allNotifications.filter((n) => {
    return !n.viewedIds.includes(sellerId);
  });
  res.json({ notifications: unreadNotifications.reverse() });
}
