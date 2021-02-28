import ValidationDocument from "models/ValidationDocument";
import { sellerPopulate } from "utils/documentPopulate";

export default async function getPendingApproval(req: any, res: any) {
  const { id } = req.params;

  try {
    const pending_approval = await ValidationDocument.findById(id).populate({
      ...sellerPopulate,
    });
    res.json({ pending_approval });
  } catch (err) {
    res.json({ pending_approval: null });
  }
}
