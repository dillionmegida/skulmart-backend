export default async function userTypeRequired(req: any, res: any, next: any) {
  const { user_type } = req.body as { user_type: "buyer" | "seller" };

  if (user_type !== "buyer" && user_type !== "seller")
    return res.status(400).json({
      message: "User type not specified",
    });

  next();
}
