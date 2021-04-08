import { promises as fsPromises, statSync } from "fs";
import { resolve } from "path";

/**
 * Traverse a folder and return absolute paths
 * @param path Path to the folder to be traversed. If path path points to file, return path.
 * @param keepFolders If set to false, will discard all folders from the list.
 * @param recursive Whether to also traverse sub-folders
 */
export default async function traverse(path: string, keepFolders: boolean = true, recursive: boolean) {
  const absolute = resolve(path);
  if (!(await fsPromises.stat(absolute)).isDirectory()) return absolute;

  const contents = (await fsPromises.readdir(absolute)).map(p => resolve(absolute, p));
  var result = contents;
  if (recursive) {
    const promises = contents.map(p => traverse(p, keepFolders, true));
    result = (await Promise.all(promises) as string[]);
  }

  if (!keepFolders) {
    return result.reduce<string[]>((acc, val) => statSync(val).isDirectory() ? acc : acc.concat(val), []);
  }
  return result;
}