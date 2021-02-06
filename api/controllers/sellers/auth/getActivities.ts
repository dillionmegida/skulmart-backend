import { ACTIVITY_PER_PAGE } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Activity from "models/Activity";

export default async function getActivities(req: any, res: any) {
  try {
    const { page: _page } = req.query;
    const page = parseInt(_page, 10);

    const loggedInSeller = req.user as SellerInterface;

    const criteria = {
      seller: loggedInSeller._id,
    };

    const totalCount = await Activity.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / ACTIVITY_PER_PAGE) - 1;

    const activities = await Activity.find({ ...criteria })
      .limit(ACTIVITY_PER_PAGE)
      .skip(page * ACTIVITY_PER_PAGE)
      .populate({ path: "seller", select: "-password -views_devices" })
      .populate("order");

    res.json({ activities, totalPages });
  } catch (err) {
    res.status(500).json({
      error: err,
      message: "Could not get activities",
    });
  }
}
