import { cyan, gray } from "chalk";
import { prompt } from "enquirer";
import execa from "execa";
import { existsSync, promises as fsPromises, rmSync } from "fs";
import ora from "ora";
import { join, resolve } from "path";
import { Command } from "tauris";
import { error, info } from "../../utils/log";
import { repoName } from "../../utils/repo";

export const initCommand = new Command("init")
  .describe("Initialize an inert project")
  .usage("inert init [directory] [options]")
  .option("T", {
    alias: ["template"],
    description: `Template github repo (default: codemaster138/inert-default)`,
    type: "text",
  })
  .handler(async (argv: { [key: string]: any }) => {
    const dir: string = resolve(process.cwd(), argv.parameters?.[0] ?? ".");
    info(`Initializing project in ${cyan(dir)}`);

    const template: string = argv.T ?? "codemaster138/inert-default";
    if (template === "codemaster138/inert-default") {
      info("Using default template");
    }

    const spinner = ora({
      text: "Donwloading Template",
      indent: 2
    }).start();
    const repo = repoName(template);
    if (repo === false) {
      spinner.stop();
      error(`Invalid repository name: ${cyan(template)}`);
      error("");
      error(`Examples of valid repository names are:`);
      error(
        `\t- user/repo                           => resolves to https://github.com/user/repo`
      );
      error(
        `\t- user/repo.git                       => resolves to https://github.com/user/repo`
      );
      error(
        `\t- https://gitlab.com/user/repo        => resolves to https://gitlab.com/user/repo`
      );
      error("");
      process.exit(1);
    }

    spinner.text = `Downloading Template: ${cyan(repo.url)}`;
    await execa("git", ["clone", repo.url, dir]).catch(() => {
      spinner.stop();
      error(`Failed to clone repository ${cyan(repo.url)}`);
      error(
        `Please make sure you have git installed and that the repository exists`
      );
    });

    spinner.succeed().start("Setting up template");
    if (existsSync(join(dir, ".git")))
      rmSync(join(dir, ".git"), { recursive: true, force: true }); // Remove the .git directory

    if (!existsSync(join(dir, "inert.config.js"))) {
      spinner.stop();
      const { answer }: any = await prompt({
        type: "confirm",
        name: "answer",
        message:
          "The repo you specified doesn't seem to be a valid inert template. Would you like to cancel the operation?",
      });

      if (answer) {
        spinner.start("Canceling");
        spinner.color = "red";
        await fsPromises.rm(dir, { recursive: true, force: true });
        spinner.color = "white";
        spinner.succeed("Operation canceled");
        process.exit();
      }
    }
    spinner.succeed();

    info("");
    info(`Successfully set up yout project!`);
    info("");
    info(`Here's a few things you can do:`);
    info(`${gray('$')} cd ${cyan(dir)}  ${gray('// Enter your project directory')}`);
    info(`${gray('$')} inert ${cyan('build')}  ${gray('// Build your project')}`);
  });
