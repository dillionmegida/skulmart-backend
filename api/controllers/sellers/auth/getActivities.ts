import { ACTIVITY_PER_PAGE } from "constants/index";
import SellerInterface from "interfaces/Seller";
import Activity from "models/Activity";
import { sliceAndReverse } from "utils/arrays";
import { sellerPopulate } from "utils/documentPopulate";

export default async function getActivities(req: any, res: any) {
  try {
    const { page: _page = 0 } = req.query;
    const page = parseInt(_page, 10);

    const loggedInSeller = req.user as SellerInterface;

    const criteria = {
      seller: loggedInSeller._id,
    };

    const totalCount = await Activity.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / ACTIVITY_PER_PAGE) - 1;

    const activities = await Activity.find({ ...criteria })
      .populate({ ...sellerPopulate })
      .populate("order");

    const modifiedActivities = sliceAndReverse({
      arr: activities,
      limit: ACTIVITY_PER_PAGE,
      currentPage: page,
    });

    res.json({ activities: modifiedActivities, totalPages });
  } catch (err) {
    res.status(500).json({
      error: err,
      message: "Could not get activities",
    });
  }
}
