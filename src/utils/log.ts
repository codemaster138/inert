import { blue, cyan, gray, red, white, yellow } from "chalk";
import stringLength from "string-length";
import wrapAnsi from "wrap-ansi";
import { performance } from "perf_hooks";

const start = performance.now();

/**
 * 
 * @param level Log level, e.g. 'error' or 'info'
 * @param interface_ Log interface, e.g `console.log` for info or console.error for errors
 * @param color Color to display the level in
 * @param message Message(s) to display
 */
function _msg(
  level: string,
  interface_: (msg: string) => void,
  color?: (s: string) => string,
  ...message: string[]
) {
  const delay = Math.floor(performance.now() - start);
  const msg = wrapAnsi(message.join(" "), process.stdout.columns - 11 - delay.toString().length - stringLength(level));
  msg.split("\n").forEach((line: string) => {
    interface_(
      `  ${gray(`[${(color || white)(level)}]`)} ${line} ${" ".repeat(
        process.stdout.columns - stringLength(line) - stringLength(level) - 9 - delay.toString().length
      )}${gray(`+${delay}ms`)}`
    );
  });
}

export function info(...message: string[]) {
  _msg("info", console.log, cyan, ...message);
}

export function verb(...message: string[]) {
  _msg("verb", console.log, blue, ...message);
}

export function error(...message: string[]) {
  _msg("error", console.error, red, ...message);
}

export function warn(...message: string[]) {
  _msg("warn", console.error, yellow, ...message);
}

export class Logger {
  enabled: boolean;
  verbose: boolean;
  constructor(enabled?: boolean, verbose?: boolean) {
    this.enabled = enabled ?? true;
    this.verbose = verbose ?? false;
  }

  info(...message: string[]) {
    if (this.enabled) _msg("info", console.log, cyan, ...message);
  }

  verb(...message: string[]) {
    if (this.enabled) _msg("verb", console.log, blue, ...message);
  }

  error(...message: string[]) {
    if (this.enabled) _msg("error", console.error, red, ...message);
  }

  warn(...message: string[]) {
    if (this.enabled) _msg("warn", console.error, yellow, ...message);
  }
}
