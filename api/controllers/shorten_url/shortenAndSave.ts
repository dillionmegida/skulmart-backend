import { shortenUrlAndSave } from "utils/urls";

export default async function shortenAndSave(req: any, res: any) {
  const { url } = req.body as { url: string };

  const shortenRes = await shortenUrlAndSave(url);

  res.json({
    message: "Shortened URL successfully",
    short_url: shortenRes.short_url,
  });
}
