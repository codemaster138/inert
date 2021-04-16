import { InertConfig, InertFile } from "../types";
import { promises as fsPromises } from "fs";
import { resolve } from "path";
import { resolveOutDir } from "../utils/dirs";

/**
 * Create a build middleware that copies files from their original location into the target directory
 */
export default function copy(destination: string) {
  return async (config: InertConfig, file: InertFile, previous: any) => {
    const _destination = resolve(process.cwd(), resolveOutDir(config, config.build.outDirs[destination]), file.relative);
    await fsPromises.copyFile(file.path, _destination);
    return previous;
  };
}