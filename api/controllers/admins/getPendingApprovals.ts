import ValidationDocument from "models/ValidationDocument";
import { sellerPopulate } from "utils/documentPopulate";

export default async function getPendingApprovals(req: any, res: any) {
  const pending_approvals = await ValidationDocument.find().populate({
    ...sellerPopulate,
  });

  res.json({ pending_approvals });
}
