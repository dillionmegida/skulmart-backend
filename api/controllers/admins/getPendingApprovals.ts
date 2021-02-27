import ValidationDocument from "models/ValidationDocument";

export default async function getPendingApprovals(req: any, res: any) {
  const pending_approvals = await ValidationDocument.find().populate({
    path: "seller",
    select: "-views_devices -password",
  });

  res.json({ pending_approvals });
}
