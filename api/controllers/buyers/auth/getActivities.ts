import { ACTIVITY_PER_PAGE } from "constants/index";
import BuyerInterface from "interfaces/Buyer";
import Activity from "models/Activity";
import { sliceAndReverse } from "utils/arrays";

export default async function getActivities(req: any, res: any) {
  try {
    const { page: _page = 0 } = req.query;
    const page = parseInt(_page, 10);

    const loggedInBuyer = req.user as BuyerInterface;

    const criteria = {
      buyer: loggedInBuyer._id,
    };

    const totalCount = await Activity.countDocuments({ ...criteria });
    const totalPages = Math.ceil(totalCount / ACTIVITY_PER_PAGE) - 1;

    const activities = await Activity.find({ ...criteria })
      .populate({ path: "buyer", select: "-password" })
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
