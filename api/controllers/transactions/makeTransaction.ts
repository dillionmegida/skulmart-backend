import TransactionInterface from "interfaces/TransactionInterface";

export default async function makeTransaction(req: any, res: any) {
  const { products } = req.body as { products: TransactionInterface };
  console.log({ products });
}
