import { Command } from "tauris";
import { build } from "../../core";
import { performance } from "perf_hooks";
import { cyan, red } from "chalk";
import ora from "ora";

export const buildCommand = new Command("build")
  .describe('Build an inert project. Only works when run from an inert project directory.')
  .option('W', {
    alias: ['watch'],
    description: 'Watch the project for changes',
    type: 'boolean',
  })
  .option('D', {
    alias: ['dev', 'development'],
    description: 'Development build. Skip slow tasks like image optimization, etc',
    type: 'boolean'
  })
  .handler(async (argv: { [key: string]: any }) => {
    const spinner = ora({ text: 'Building project', indent: 0 }).start();
    const start = performance.now();
    const successState = await build({ logging: true, spinner: spinner, development: argv.D || false });
    spinner.stop();
    console.log();
    spinner.start();
    spinner[successState ? 'succeed' : 'fail'](`Operation ${successState ? cyan('succeeded') : red('failed')} in ${cyan(`${Math.floor(performance.now() - start)}ms`)}`);
  });