import { InertConfig, InertFile } from "../types";

export default function halt() {
  return (config: InertConfig, file: InertFile): void => {
    return undefined;
  };
}