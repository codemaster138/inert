import { InertConfig, InertFile } from "../types";

export default function halt(value?: any) {
  return (config: InertConfig, file: InertFile): void => {
    return value;
  };
}