import { domain } from "config/siteDetails";
import ShortenedUrl from "models/ShortenedUrl";

export default async function redirectShortUrl(req: any, res: any) {
  const { short_url } = req.params as { short_url: string };

  const url = await ShortenedUrl.findOne({ short_url });

  if (!url) return res.redirect(domain);

  res.redirect(302, url.long_url);
}
