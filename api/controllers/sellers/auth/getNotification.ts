import SellerNotificationMessage from "models/SellerNotificationMessage";

export default async function getNotification(req: any, res: any) {
  const { id = null } = req.params;

  const sellerId = req.user._id;
  if (id) {
    try {
      const notification = await SellerNotificationMessage.findById(id);

      if (!notification)
        return res.status(400).json({ message: "Notification not found" });

      const viewedIds = notification.viewedIds.includes(sellerId)
        ? [...notification.viewedIds]
        : [...notification.viewedIds].concat(sellerId);
      await SellerNotificationMessage.findByIdAndUpdate(id, {
        $set: {
          viewedIds: [...viewedIds],
        },
      });
      return res.json({
        message: "",
      });
    } catch (err) {
      console.log("Error occurred during reading notification >> ");
      res.status(400).json({
        error: err,
        message: "Error occured! Please try again.",
      });
    }
  }
}
