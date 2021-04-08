import { extname, basename, dirname } from "path";

/**
 * Get information about a file
 * @param path Path to file
 */
export function getFileInfo(path: string) {
  return {
    path,
    extension: extname(path),
    basename: basename(path),
    withoutExtension: basename(path, extname(path)),
    dirname: dirname(path)
  }
}