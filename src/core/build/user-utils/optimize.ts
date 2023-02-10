import multimatch from "multimatch";
import { InertConfig, InertFile } from "../types";
import imageSize from "image-size";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import sharp from "sharp";
import { resolve, join, dirname, sep} from "path";
import { resolveOutDir } from "../utils/dirs";
import { cyan } from "chalk";
import { asyncChecksum } from "../utils/checksum";

export interface OptimizeOptions {
  /**
   * An array of globs to ignore
   */
  ignore: string[];
  /**
   * Override the downscaling widths. The full width of the original image is
   * always automatically included in this list.
   */
  widths?: number[];
}

/**
 * Create a build middleware that converts images to webp and adds downscaled versions
 *
 * The resulting middleware will pass the return value from the previous step through to the next
 * @returns A build middleware that converts images to webp and adds downscaled versions
 */
export default function optimize(outFolder: string, options: OptimizeOptions) {
  return async (config: InertConfig, file: InertFile, previous: any) => {
    if (![".png", ".jpg", ".jpeg"].includes(file.extension)) return; // File not a supported image
    if (
      multimatch([file.relative], options.ignore || ["!*"]).includes(
        file.relative
      )
    ) {
      return; // File ignored
    }

    // Load image index
    const imageIndexPath = resolve(
      process.cwd(),
      resolveOutDir(config, ":output:"),
      "image-index.json"
    );
    var imageIndex: { [key: string]: any } = existsSync(imageIndexPath)
      ? JSON.parse(readFileSync(imageIndexPath).toString())
      : {};

    if (config.custom?.dev) {
      config.custom?.spinner?.stop();
      config.custom?.log.info(
        `Skipping optimization for ${cyan(file.basename)} (Development build)`
      );
      config.custom?.spinner?.start();
      return; // Image didn't change; no need to optimize
    }

    const source = readFileSync(file.path);
    const spinner_text = config.custom?.spinner?.text;
    if (config.custom?.spinner)
      config.custom.spinner.text = `Processing image: ${cyan(file.basename)}`;

    const hash = await asyncChecksum(file.path);

    if (imageIndex[file.inProject]?.hash === hash) {
      config.custom?.spinner?.stop();
      config.custom?.log.info(`Already optimized: ${cyan(file.basename)}`);
      config.custom?.spinner?.start();
      return; // Image didn't change; no need to optimize
    }

    if (!imageIndex[file.inProject]) {
      imageIndex[file.inProject] = {
        hash: hash,
        srcsets: {
          // The keys will be ignored when building HTML
          webp: [],
          default: [],
        },
      };
    }
    if (config.custom?.spinner)
      config.custom.spinner.text = `Optimizing image: ${cyan(file.basename)}`;

    const resolution = imageSize(source);
    const path_extless = file.relative.slice(0, -file.extension.length);
    const fullSize = await sharp(source).webp({ lossless: true }).toBuffer();
    mkdirSync(
      resolve(
        process.cwd(),
        resolveOutDir(config, config.build.outDirs[outFolder]),
        `webp/${path_extless.includes(sep) ? dirname(path_extless) : ""}`
      ),
      {
        recursive: true,
      }
    );
    mkdirSync(
      resolve(
        process.cwd(),
        resolveOutDir(config, config.build.outDirs[outFolder]),
        dirname(path_extless)
      ),
      { recursive: true }
    );
    writeFileSync(
      resolve(
        process.cwd(),
        resolveOutDir(config, config.build.outDirs[outFolder]),
        `webp/${path_extless}.webp`
      ),
      fullSize
    );
    imageIndex[file.inProject].srcsets.webp.push(
      `${join(
        resolveOutDir(config, config.build.outDirs[outFolder]).slice(
          resolveOutDir(config, ":output:").length
        ),
        `webp/${path_extless}.webp`
      )} ${resolution.width}w`
    );

    for (const width of options.widths || [460, 720, 1080, 2048]) {
      if (width > (resolution.width as number)) continue; // Target width greater than source width
      if (file.extension === ".png") {
        // File is a PNG file, so create a downscaled PNG
        const pngBuffer = await sharp(source)
          .resize({ width: width })
          .png()
          .toBuffer();
        writeFileSync(
          resolve(
            process.cwd(),
            resolveOutDir(config, config.build.outDirs[outFolder]),
            `${path_extless}-${width}w.png`
          ),
          pngBuffer
        );
        imageIndex[file.inProject].srcsets.default.push(
          `${join(
            resolveOutDir(config, config.build.outDirs[outFolder]).slice(
              resolveOutDir(config, ":output:").length
            ),
            `${path_extless}-${width}w.png`
          )} ${width}w`
        );
      } else {
        // File is a JPEG file, so create a downscaled JPEG
        const jpegBuffer = await sharp(source)
          .resize({ width: width })
          .jpeg()
          .toBuffer();
        writeFileSync(
          resolve(
            process.cwd(),
            resolveOutDir(config, config.build.outDirs[outFolder]),
            `${path_extless}-${width}w.jpeg`
          ),
          jpegBuffer
        );
        imageIndex[file.inProject].srcsets.default.push(
          `${join(
            resolveOutDir(config, config.build.outDirs[outFolder]).slice(
              resolveOutDir(config, ":output:").length
            ),
            `${path_extless}-${width}w.jpg`
          )} ${width}w`
        );
      }
      const webpBuffer = await sharp(source)
        .resize({ width: width })
        .webp({ lossless: true })
        .toBuffer();
      writeFileSync(
        resolve(
          process.cwd(),
          resolveOutDir(config, config.build.outDirs[outFolder]),
          `webp/${path_extless}-${width}w.webp`
        ),
        webpBuffer
      );
      imageIndex[file.inProject].srcsets.webp.push(
        `${join(
          resolveOutDir(config, config.build.outDirs[outFolder]).slice(
            resolveOutDir(config, ":output:").length
          ),
          `webp/${path_extless}-${width}w.webp`
        )} ${width}w`
      );
    }
    if (config.custom?.spinner) config.custom.spinner.text = spinner_text;
    writeFileSync(imageIndexPath, JSON.stringify(imageIndex, undefined, 2));
    return previous;
  };
}
