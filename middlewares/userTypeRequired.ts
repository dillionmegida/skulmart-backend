export default async function userTypeRequired(req: any, res: any, next: any) {
  type ExpectedObj = { user_type: "buyer" | "seller" };

  // user_type can be sent through req.body (in the case of POST request)
  // or through headers (in the case of GET request)
  const { user_type: userTypeFromReqBody } = req.body as ExpectedObj;
  const { user_type: userTypeFromHeader } = req.headers as ExpectedObj;

  if (
    userTypeFromReqBody !== "buyer" &&
    userTypeFromReqBody !== "seller" &&
    userTypeFromHeader !== "buyer" &&
    userTypeFromHeader !== "seller"
  )
    return res.status(400).json({
      message: "User type not specified",
    });

  next();
}
