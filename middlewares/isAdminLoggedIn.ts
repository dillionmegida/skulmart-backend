import Admin from "models/Admin";
import { getTokenFromCookie, isTokenValid } from "utils/token";

export default async function isAdminLoggedIn(req: any, res: any, next: any) {
  const token = getTokenFromCookie(req);

  const tokenString = token ? token.split(" ")[1] : undefined;

  if (!token || !tokenString)
    return res.status(401).json({ message: "Not authorized" });

  const decoded = isTokenValid(tokenString);

  if (!decoded) return res.status(401).json({ message: "Not authorized" });

  try {
    const { admin: adminFromHeaders = null } = req.headers;

    if (!adminFromHeaders)
      return res.status(401).json({ message: "Not authorized" });

    req.admin = await Admin.findById(decoded._id).select("-password");
    next()
  } catch {
    return res.status(401).json({ message: "Not authorized" });
  }
}
