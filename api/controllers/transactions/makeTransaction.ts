import TransactionInterface from "interfaces/TransactionInterface";

export default async function makeTransaction(req: any, res: any) {
  const { transaction } = req.body as { transaction: TransactionInterface };
  console.log({ transaction });
}
