import { Command } from "tauris";
import { build } from "../../core";
import { performance } from "perf_hooks";
import { info } from "../../utils/log";
import { cyan, red } from "chalk";

export const buildCommand = new Command("build")
  .describe('Build an inert project. Only works when run from an inert project directory.')
  .option('W', {
    alias: ['watch'],
    description: 'Watch the project for changes',
    type: 'boolean',
  })
  .handler(async (argv: { [key: string]: any }) => {
    const start = performance.now();
    const successState = await build({ logging: true });
    console.log();
    info(`Operation ${successState ? cyan('succeeded') : red('failed')} in ${cyan(`${performance.now() - start}ms`)}`);
  });