import { InertConfig, InertFile } from "../types";
import { readFileSync } from "fs";
import MarkdownIt from "markdown-it";
import Prism from "prismjs";
import fm from "front-matter";
import { cyan } from "chalk";
import { getOptimizedImage } from ".";
import markdownItNamedHeadings from "markdown-it-named-headings";
// Load all prism-supported languages
require("prismjs/components/index")();

/**
 * Return a build utility that compiles markdown to html
 */
export default function markdown(markdownItOptions?: MarkdownIt.Options) {
  return (config: InertConfig, file: InertFile, previous: any) => {
    const default_options: MarkdownIt.Options = {
      highlight: (str: string, lang: string) => {
        if (lang && Prism.languages[lang]) {
          return `<pre class="lang-${lang}"><code>${Prism.highlight(
            str,
            Prism.languages[lang],
            lang
          )}</code></pre>`;
        }

        return `<pre class="lang-${lang}"><code>${str}</code></pre>`;
      },
      linkify: true,
    };

    const compiler = new MarkdownIt({
      ...default_options,
      ...(markdownItOptions || {}),
    });

    compiler.use(markdownItNamedHeadings)

    const defaultImage = compiler.renderer.rules.image || (() => '');
    compiler.renderer.rules.image = (tokens, idx, options, env, self): string => {
      const token = tokens[idx];
      const srcIdx = token.attrIndex('src');

      return getOptimizedImage(config, token.attrs?.[srcIdx][1] || '') || defaultImage(tokens, idx, options, env, self);
    };

    const spinner_text = config.custom?.spinner?.text;
    if (config.custom?.spinner)
      config.custom.spinner.text = `Building markdown: ${cyan(file.basename)}`;
    const markdown = readFileSync(file.path).toString();
    const content = fm(markdown);
    const result = {
      ...content,
      body: compiler.render(content.body),
    };

    if (config.custom?.spinner) config.custom.spinner.text = spinner_text;
    return result;
  };
}
