import { renderSync } from "sass";
import { InertConfig, InertFile } from "../types";

/**
 * Generate an inert build middleware that compiles sass
 * @returns An inert build middleware that compiles sass
 */
export default function sass() {
  return (_: InertConfig, file: InertFile) => {
    // Somewhat counter-intuitively, `renderSync` is more than 2x faster than the async version, `render`...
    return renderSync({
      file: file.path
    }).css;
  }
}