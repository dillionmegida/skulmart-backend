module.exports = function subdomain(mainFn, storeFn, adminFn) {
  return async function (req, res, next) {
    // store_name is attached to req by middleware getStore

    if (req.subdomain === null) return mainFn(req, res, next);

    if (req.admin) return adminFn(req, res, next);

    return storeFn(req, res, next);
  };
};
