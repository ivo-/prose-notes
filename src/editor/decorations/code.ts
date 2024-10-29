import hljs from "highlight.js";
import mermaid from "mermaid";
import { Decoration } from "prosemirror-view";
import { DECORATION_CLASS_PREFIX } from "../constants";
import schema from "../schema";
import { ProseDecoration } from "../types";
import { toRealSpaces } from "../utils";
import { getParserFromContext, getVarRegex } from "./var";
import { Context } from "../types";

import "highlight.js/styles/arta.css";

export const className = `${DECORATION_CLASS_PREFIX}--code`;
export const highlightClassName = `${className}--highlight`;

export const MERMAID_LANG = "mermaid";
export const MERMAID_CONTAINER_ID = "mermaid-container";

export default {
  name: "code",
  type: "multi-node",
  regex: /^```/gi,
  className,
  widget: (textContent, pos, _, context) => {
    const lang = textContent[0].replace("```", "");
    const source = textContent.slice(1, -1).join("\n");
    return [
      Decoration.widget(
        pos,
        () => {
          return handleSyntaxHighlight(source, lang);
        },
        {
          key: "code-" + source,
        }
      ),
      ...(lang === MERMAID_LANG
        ? (() => {
            const evaluatedSource = evaluateMermaidSource(source, context);

            return [
              Decoration.widget(
                pos - 1,
                () => handleMermaid(evaluatedSource, context),
                {
                  key: "code-mermaid-" + evaluatedSource,
                }
              ),
            ];
          })()
        : []),
    ];
  },
  commands: {
    "Insert Code": (tr) => {
      // TODO: fix selection
      // debugger;
      // const resolvedPos = tr.doc.resolve(
      //   tr.selection.anchor - tr.selection.$anchor.nodeBefore.nodeSize
      // );
      // tr.setSelection(new NodeSelection(resolvedPos));
      // const { $from, to } = view.state.selection;

      return tr
        .replaceSelectionWith(
          schema.nodes.paragraph.create(null, schema.text("```"))
        )
        .replaceSelectionWith(
          schema.nodes.paragraph.create(null, schema.text(" "))
        )
        .replaceSelectionWith(
          schema.nodes.paragraph.create(null, schema.text("```"))
        );
    },
  },
} as ProseDecoration;

const handleSyntaxHighlight = (source: string, lang: string) => {
  const dom = document.createElement("pre");
  const content = hljs.getLanguage(lang)
    ? hljs.highlight(lang, source).value
    : source;
  dom.innerHTML = `\`\`\`${lang}\n${content}\n\`\`\``;

  dom.classList.add(`${highlightClassName}`);

  return dom;
};

// =============================================================================
// Mermaid

const varRegExp = getVarRegex();
const evaluateMermaidSource = (source: string, context: Context) => {
  const parser = getParserFromContext(context);

  return toRealSpaces(source)
    .trim()
    .replaceAll(varRegExp, (expression: string, m: string) => {
      let value: string = "";
      try {
        value = parser.evaluate(toRealSpaces(m));
      } catch (e) {
        console.log(`Evaluation error: ${expression}`);
        value = `Evaluation error: ${expression}`;
      }

      return value;
    });
};

const handleMermaid = (source: string, context: Context) => {
  const dom = document.createElement("div");
  const id = "id" + (Math.random() + 1).toString(36).substring(7);

  if (!context.mermaidContainer) {
    context.mermaidContainer = document.querySelector(
      `#${MERMAID_CONTAINER_ID}`
    );

    if (!context.mermaidContainer) {
      throw new Error("Mermaid container not found");
    }
  }

  const container = context.mermaidContainer as HTMLElement;

  mermaid
    .render(id, source, container)
    .then(({ svg }) => {
      dom.innerHTML = svg;
    })
    .catch((e) => {
      dom.innerHTML = e.message.split("\n")[0];
    });

  return dom;
};
