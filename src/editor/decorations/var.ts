import { Parser, all, create } from "mathjs";
import { Decoration } from "prosemirror-view";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { ProseDecoration } from "../types";
import { toRealSpaces } from "../utils";
import { isTableRow } from "./table-row";

export const math = create(all, { matrix: "Array" });

export const getParserFromContext = (context: { [key: string]: unknown }) => {
  if (!context.parser) {
    context.parser = math.parser();
  }
  return context.parser as Parser;
};

export const getVarRegex = () => /\{\{([^\}]+)}}/gi;

export const className = `${DECORATION_CLASS_PREFIX}--var`;
export const labelClassName = `${className}--label`;
export default {
  name: "var",
  type: "inline",
  regex: getVarRegex(),
  className,
  widget: (m, pos, node, context) => {
    const parser = getParserFromContext(context);
    const isInTableRow = isTableRow(String(node.text));

    let value: string = "";
    try {
      value = parser.evaluate(toRealSpaces(m[1]));
    } catch (e) {
      console.log("Error", m, e);
      value = "Error";
    }

    return [
      ...(isInTableRow
        ? []
        : [
            Decoration.widget(
              pos + m.index + m[0].length,
              () => {
                const dom = document.createElement("span");
                dom.innerHTML = value;

                dom.classList.add(`${labelClassName}`, "tag", "is-info");

                return dom;
              },
              {
                key: "var-label-" + m[0] + value,
                side: 1,
                ignoreSelection: true,
              }
            ),
          ]),
      Decoration.inline(pos + m.index, pos + m.index + m[0].length, {
        class: className,
        ...(isInTableRow ? { "data-tooltip": value } : {}),
      }),
    ];
  },
} as ProseDecoration;
