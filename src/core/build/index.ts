import { Logger } from "../../utils/log";
import { promises as fsPromises, existsSync } from "fs";
import { resolve, join } from "path";
import { cyan, gray } from "chalk";
import * as buildUtils from "./user-utils";
import { InertConfig } from "./typings";
import { resolveSourceDir } from "./utils/dirs";

export interface BuildOptions {
  logging?: boolean;
}

/**
 * Build a project
 */
export default async function build(options: BuildOptions) {
  // Create a logger. The logger allows us to disable logging.
  const log = new Logger(options.logging);

  // Constants
  const project_dir = resolve(process.cwd());

  // Make sure an inert configuration file exists.
  if (!(await existsSync(join(project_dir, "inert.config.js")))) {
    log.error(
      "The current working directory does not appear to be a valid inert project."
    );
    log.error(`You can create a new project using the following command:`);
    log.error(`${gray("$")} inert ${cyan(`init ${project_dir}`)}`);
    return false;
  }

  // Load the configuration file
  (global as any).inert = buildUtils; // Allthough this is generally considered bad practice, I think it works very well for this purpose.
  const config: InertConfig = require(join(project_dir, "inert.config.js"));

  // Make sure each source directory exists
  if (
    Object.keys(config.build.sourceDirs)
      .map((dir) =>
        existsSync(join(project_dir, resolveSourceDir(config, dir)))
      )
      .some((v) => v === false)
  ) {
    log.error(`Missing some source directories. Make sure every directory defined in 'config.build.sourceDirs' exists`);
    return false;
  }

  return true;
}