export default function subdomain(mainFn, storeFn, adminFn) {
  return async function (req: any, res: any, next: any) {
    // store_name is attached to req by middleware getStore

    if (req.subdomain === null) return mainFn(req: any, res: any, next: any);

    if (req.admin) return adminFn(req: any, res: any, next: any);

    return storeFn(req: any, res: any, next: any);
  };
};
