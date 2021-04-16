import { Logger } from "../../utils/log";
import { promises as fsPromises, existsSync } from "fs";
import { resolve, join } from "path";
import { cyan, gray } from "chalk";
import * as buildUtils from "./user-utils";
import { InertConfig } from "./types";
import { resolveOutDir, resolveSourceDir, resolveTemplate } from "./utils/dirs";
import { Ora } from "ora";
import traverse from "./utils/traverse";
import { getFileInfo } from "./utils/file";

export interface BuildOptions {
  logging?: boolean;
  verbose?: boolean;
  development?: boolean;
  spinner?: Ora;
}

/**
 * Build a project
 */
export default async function build(options: BuildOptions) {
  // Create a logger. The logger allows us to disable logging.
  const log = new Logger(options.logging, options.verbose ?? true);
  options.spinner?.stop();
  if (options.development) log.info('DEVELOPMENT BUILD');
  options.spinner?.start();

  // Constants
  const project_dir = resolve(process.cwd());

  // Make sure an inert configuration file exists.
  if (!(await existsSync(join(project_dir, "inert.config.js")))) {
    options.spinner?.stop();
    log.error(
      "The current working directory does not appear to be a valid inert project."
    );
    log.error(`You can create a new project using the following command:`);
    log.error(`${gray("$")} inert ${cyan(`init ${project_dir}`)}`);
    options.spinner?.start();
    return false;
  }

  // Load the configuration file
  (global as any).inert = buildUtils; // Allthough this is generally considered bad practice, I think it works very well for this purpose.
  var config: InertConfig = require(join(project_dir, "inert.config.js"));
  config.custom = config.custom || {};
  config.custom.spinner = options.spinner;
  config.custom.log = log;
  config.custom.dev = options.development;

  // Make sure each source directory exists
  if (
    Object.keys(config.build.sourceDirs)
      .map((dir) =>
        existsSync(join(project_dir, resolveSourceDir(config, dir)))
      )
      .some((v) => v === false)
  ) {
    options.spinner?.stop();
    log.error(
      `Missing some source directories. Make sure every directory defined in 'config.build.sourceDirs' exists`
    );
    options.spinner?.start();
    return false;
  }

  // Set up output directory
  const out_dir = join(project_dir, resolveOutDir(config, ":output:"));
  options.spinner?.stop();
  if (existsSync(out_dir)) {
    log.verb("Output directory already exists");
  } else {
    log.verb(`Creating output directory: ${out_dir}`);
    await fsPromises.mkdir(out_dir);
  }
  // Create subdirs
  for (let outdir in config.build.outDirs) {
    await fsPromises.mkdir(
      join(project_dir, resolveOutDir(config, config.build.outDirs[outdir])),
      { recursive: true }
    );
  }
  options.spinner?.start();

  // Build folders first, the build root. This makes sure that all optimized assets are
  // already available when the root is built
  const folders = config.build.folders;

  for (let folder of folders) {
    const path = join(project_dir, resolveSourceDir(config, folder.folder));
    options.spinner?.stop();
    log.verb(`Building ${cyan(path)}`);
    options.spinner?.start();

    const files = (await traverse(
      path,
      false,
      folder.build.traverseLevel === "rescursive" ? true : false
    )) as string[];
    options.spinner?.stop();
    log.verb();
    log.verb(`Traverse yielded ${cyan(path)}`);
    log.verb();
    options.spinner?.start();
    // Iterate over all files
    for (const file of files) {
      // Run the build pipeline
      let prev_res: any = undefined;
      for (const step of folder.build.filePipeline) {
        // Make sure `step` is a function; not everyone uses typescript
        if (typeof step !== "function") {
          options.spinner?.stop();
          log.warn(
            "Pipeline component is not a function. Skipping. Please make sure all elements in the filePipeline are functions."
          );
          options.spinner?.start();
          continue;
        }
        prev_res = await step(config, getFileInfo(file, path), prev_res);
      }
    }

    options.spinner?.stop();
    log.verb(`Done building ${cyan(path)}`);
    options.spinner?.start();
  }

  const rootFile = resolveTemplate(config, config.build.rootFile);
  let prev: any = undefined
  for (const step of config.build.slashPipeline) {
    if (typeof step !== "function") {
      options.spinner?.stop();
      log.warn(
        "Pipeline component is not a function. Skipping. Please make sure all elements in the filePipeline are functions."
      );
      options.spinner?.start();
      continue;
    }
  
    prev = step(config, getFileInfo(rootFile, project_dir), prev);
  }

  return true;
}
