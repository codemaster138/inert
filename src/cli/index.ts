import getPackageVersion from "@jsbits/get-package-version";
import { Command } from "tauris";
import { error } from "../utils/log";
import { initCommand } from "./commands/init";
import { buildCommand } from "./commands/build";

(async () => {
  const argv = new Command("inert")
    .header("A static site generator for the modern web")
    .option("v", {
      alias: ["version"],
      description: "Display the version number and exit",
      type: "boolean",
    })
    .command(initCommand)
    .command(buildCommand)
    .demandArgument()
    .parse(process.argv.slice(2));
  if (!argv) return; // No arguments provided, just do nothing

  if (argv.v) {
    console.log(getPackageVersion(__dirname));
    return 0;
  }
})()
  .then((n: number | void) => {
    if (n !== null && n !== undefined) process.exit(n);
  })
  .catch((err: any) => {
    error(err.message || err);
    process.exit(err.code || 1);
  });
