import { extname, basename, dirname } from "path";

/**
 * Get information about a file
 * @param path Path to file
 */
export function getFileInfo(path: string, relative: string, project: string) {
  return {
    path,
    extension: extname(path),
    basename: basename(path),
    withoutExtension: basename(path, extname(path)),
    dirname: dirname(path),
    relative: path.slice(relative.length + 1),
    inProject: path.slice(project.length + 1)
  }
}