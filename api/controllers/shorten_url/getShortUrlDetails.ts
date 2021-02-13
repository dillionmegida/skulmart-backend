import ShortenedUrl from "models/ShortenedUrl";

export default async function getShortUrlDetails(req: any, res: any) {
  const { short_url } = req.params as { short_url: string };

  const url = await ShortenedUrl.findOne({ short_url });

  if (!url)
    return res.status(404).json({ message: "URL not found", url: null });

  res.json({ url });
}
