import { render } from "ejs";
import { readFileSync } from "fs";
import { InertConfig, InertFile } from "../types";
import htmlFormat from "html-format";
import { resolve } from "path";
import { resolveTemplate } from "../utils/dirs";

export default function htmlBuild(template: string, locale?: any) {
  return (config: InertConfig, _file: InertFile, data: any) => {
    const html = render(
      readFileSync(
        resolve(
          process.cwd(),
          resolveTemplate(config, config.build.templates[template])
        )
      ).toString(),
      {
        config: config,
        data: data,
        locale: locale,
        file: _file
      },
      {
        async: false,
      }
    );

    const formatted = htmlFormat(html);

    return formatted;
  };
}

export function single(locale?: any) {
  return (config: InertConfig, file: InertFile, data: any) => {
    const html = render(
      readFileSync(
        file.path
      ).toString(),
      {
        config: config,
        data: data,
        locale: locale
      }, {
        async: false
      }
    );

    const formatted = htmlFormat(html);

    return formatted;
  };
}
