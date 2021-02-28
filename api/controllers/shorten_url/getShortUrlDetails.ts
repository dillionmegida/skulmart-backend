import ShortenedUrl from "models/ShortenedUrl";

export default async function getShortUrlDetails(req: any, res: any) {
  const { hash } = req.params as { hash: string };
  const shortUrl = `https://skulmart.com/u/` + hash;

  const url = await ShortenedUrl.findOne({ short_url: shortUrl });

  if (!url)
    return res.status(404).json({ message: "URL not found", url: null });

  res.json({ url });
}
