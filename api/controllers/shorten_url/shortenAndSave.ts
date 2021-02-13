import ShortenedUrl from "models/ShortenedUrl";
import shortid from "shortid";
import { removeSpecialChars } from "utils/strings";

export default async function shortenAndSave(req: any, res: any) {
  const { url } = req.body as { url: string };

  const shortenedUrl = removeSpecialChars(shortid.generate());

  await new ShortenedUrl({
    short_url: shortenedUrl,
    long_url: url,
  }).save();

  res.json({ message: "Shortened URL successfully", short_url: shortenedUrl });
}
