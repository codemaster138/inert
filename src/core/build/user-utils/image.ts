import { resolve } from "path";
import { readFileSync, existsSync } from "fs";
import { InertConfig } from "../types";
import { resolveOutDir } from "../utils/dirs";

/**
 * Utility for loading optimized images. If the image is registered, returns a picture tag, otherwise false
 * @param name Image name
 */
export default function image(
  config: InertConfig,
  name: string
): string | false {
  // Load image index
  const imageIndexPath = resolve(
    process.cwd(),
    resolveOutDir(config, ":output:"),
    "image-index.json"
  );
  var imageIndex: { [key: string]: any } = existsSync(imageIndexPath)
    ? JSON.parse(readFileSync(imageIndexPath).toString())
    : {};

  if (!imageIndex[name.replace(/^\/+/, '')]) return false;
  return `<picture>${Object.values(
    imageIndex[name.replace(/^\/+/, '')].srcsets
  ).map(
    (srcset) => `<source srcset="${(srcset as string[]).join(", ")}"/>`
  )}<img src="${name}"/></picture>`;
}
