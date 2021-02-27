import ValidationDocument from "models/ValidationDocument";

export default async function getPendingApproval(req: any, res: any) {
  const { id } = req.params;

  try {
    const pending_approval = await ValidationDocument.findById(id).populate({
      path: "seller",
      select: "-views_devices -password",
      populate: {
        path: "store",
      },
    });
    res.json({ pending_approval });
  } catch (err) {
    res.json({ pending_approval: null });
  }
}
