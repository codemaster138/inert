import { InertConfig, InertFile } from "../types";
import { resolve, dirname } from "path";
import { writeFileSync, mkdirSync } from "fs";
import { resolveOutDir } from "../utils/dirs";

/**
 * Create a build middleware that saves files.
 * @param outFolder Folder to write to
 * @param ext File extension. If none is provided, use the original file extension
 * @param own_folder Wether to store the file in an own folder with the same name as the file. If a string is provided, it will be the name of the file in the folder.
 * @returns A build middleware that saves files
 */
export default function write(
  outFolder: string,
  ext: string,
  own_folder?: boolean | string
) {
  /**
   * Saves a file
   * @returns { void } nothing.
   */
  return (config: InertConfig, file: InertFile, previous: any) => {
    if (typeof previous !== "string" && !Buffer.isBuffer(previous)) {
      throw new TypeError(
        `Inert's "write" helper only supports strings and buffers. Got ${typeof previous}`
      );
    }

    const outPath = own_folder ?
      resolve(
        process.cwd(),
        resolveOutDir(config, config.build.outDirs[outFolder]),
        file.withoutExtension,
        typeof own_folder === "boolean" ?
          `${file.withoutExtension}${ext || file.extension}` :
          `${own_folder}${ext || file.extension}`
      ) :
      resolve(
        process.cwd(),
        resolveOutDir(config, config.build.outDirs[outFolder]),
        `${file.withoutExtension}${ext || file.extension}`
      );

    mkdirSync(dirname(outPath), { recursive: true });

    writeFileSync(outPath, previous);

    return previous;
  };
}

export function writeFile(path: string) {
  return (config: InertConfig, file: InertFile, data: any) => {
    if (typeof data !== "string" && !Buffer.isBuffer(data)) {
      throw new TypeError(
        `Inert's "write" helper only supports strings and buffers. Got ${typeof data}`
      );
    }

    const outPath = resolve(process.cwd(), resolveOutDir(config, path));
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, data);

    return data;
  };
}
