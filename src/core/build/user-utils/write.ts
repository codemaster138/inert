import { InertConfig, InertFile } from "../types";
import { resolve } from "path";
import { writeFileSync } from "fs";
import { resolveOutDir } from "../utils/dirs";

/**
 * Create a build middleware that saves files.
 * @param outFolder Folder to write to
 * @param ext File extension. If none is provided, use the original file extension
 * @returns A build middleware that saves files
 */
export default function write(outFolder: string, ext: string) {
  /**
   * Saves a file
   * @returns { void } nothing.
   */
  return (config: InertConfig, file: InertFile, previous: any) => {
    if (typeof previous !== "string" && !Buffer.isBuffer(previous)) {
      throw new TypeError(`Inert's "write" helper only supports strings and buffers. Got ${typeof previous}`);
    }

    const outPath = resolve(process.cwd(), resolveOutDir(config, config.build.outDirs[outFolder]), `${file.withoutExtension}${ext || file.extension}`);
    writeFileSync(outPath, previous);

    return previous;
  }
}

export function writeFile(path: string) {
  return (config: InertConfig, file: InertFile, data: any) => {
    if (typeof data !== "string" && !Buffer.isBuffer(data)) {
      throw new TypeError(`Inert's "write" helper only supports strings and buffers. Got ${typeof data}`);
    }

    const outPath = resolve(process.cwd(), resolveOutDir(config, path));
    writeFileSync(outPath, data);

    return data;
  }
}