import { InertConfig } from "../types";

export function resolveSourceDir(config: InertConfig, path: string): string {
  return path.replace(/:[^:]+:/gi, (value) => resolveSourceDir(config, config.build.sourceDirs[value.slice(1, -1)]));
}

export function resolveOutDir(config: InertConfig, path: string): string {
  return path.replace(/:[^:]+:/gi, (value) => resolveOutDir(config, config.build.outDirs[value.slice(1, -1)]));
}