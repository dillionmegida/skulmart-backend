export default function (req: any) {
  return req.user._doc;
  // the properties of the user are in _doc
  // after the middleware isAuthenticated, express configures the object
}
