import { InertConfig } from "../typings";

export function resolveSourceDir(config: InertConfig, path: string): string {
  return path.replace(/:[^:]+:/gi, (value) => resolveSourceDir(config, config.build.sourceDirs[value]));
}

export function resolveOutDir(config: InertConfig, path: string): string {
  return path.replace(/:[^:]+:/gi, (value) => resolveOutDir(config, config.build.outDirs[value]));
}