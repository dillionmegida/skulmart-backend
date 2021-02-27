import Store from "models/Store";

export default async function getStore(req: any, res: any, next: any) {
  const {
    store_name,
    main = null,
    merchant = null,
    admin = null,
  } = req.headers;

  if (main !== null)
    // then API requests are coming from the main app
    return next();

  if (merchant !== null)
    // then API requests are coming from the merchant app
    return next();

  if (admin !== null)
    // then API requests are coming from the admin app
    return next();

  const store = await Store.findOne({ shortname: store_name });

  // then store does not exist
  if (!store)
    return res
      .status(400)
      .json({ message: "This request is not coming from a store" });

  req.store_id = store._id;

  req.store_name = store.shortname;

  next();
}
