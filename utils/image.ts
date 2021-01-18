import sharp from "sharp";
import { v2 as cloudinary } from "cloudinary";
import chalk from "chalk";

type FormatImageArgs = {
  path: string;
  outputFile: string;
  format?: "jpeg";
};

function formatImage({
  path,
  format = "jpeg",
  outputFile,
}: FormatImageArgs): Promise<any> {
  return new Promise((resolve, reject) => {
    sharp(path)
      .resize(2000, 2000)
      .toFormat(format)
      .jpeg({
        quality: 80,
      })
      .toFile(outputFile, (err: any) => {
        if (err) return reject(err);

        resolve("success");
      });
  });
}

type UploadImageArgs = {
  path: string;
  folder: string;
  filename: string;
};
export async function uploadImage({
  path,
  filename,
  folder,
}: UploadImageArgs): Promise<
  | { public_id: string; url: string; success: true }
  | { error: any; success: false }
> {
  try {
    const outputFile = path + "-formatted";
    const formatResponse = await formatImage({ path, outputFile });

    if (formatResponse !== "success") throw formatResponse;

    const { public_id, url } = await cloudinary.uploader.upload(outputFile, {
      public_id: filename,
      folder,
    });

    return { public_id, url, success: true };
  } catch (error) {
    console.log(chalk.red("Could not upload image because >>> "), error);
    return { error, success: false };
  }
}

type DeleteImageArgs = {
  public_id: string;
  errorMsg?: string;
};
export const deleteImage = async ({
  public_id,
  errorMsg = "Image could not be deleted",
}: DeleteImageArgs): Promise<any> => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.log(chalk.red(errorMsg + " >> "), error);
    return { error };
  }
};
