import { domain } from "config/siteDetails";
import ShortenedUrl from "models/ShortenedUrl";
import shortid from "shortid";
import { removeSpecialChars } from "./strings";

export async function shortenUrlAndSave(url: string) {
  const shortenedUrl = shortUrlOnDomain(removeSpecialChars(shortid.generate()));

  await new ShortenedUrl({
    short_url: shortenedUrl,
    long_url: url,
  }).save();

  return { short_url: shortenedUrl };
}

export const shortUrlOnDomain = (short_url: string) =>
  domain + "/u/" + short_url;
