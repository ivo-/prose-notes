import { Decoration } from "prosemirror-view";
import schema from "../schema";
import { toVisibleSpaces } from "../utils";
import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import url from "./url";

const className = `${DECORATION_CLASS_PREFIX}--link`;
export default {
  name: "link",
  type: "inline",
  regex: /\[([\w\s\d]+)\]\((https?:\/\/[\w\d./?=#]+)\)/gi,
  className: className,
  widget: (m, pos) => {
    return [
      Decoration.inline(pos + m.index, pos + m.index + 1, {
        class: `${className}--bracket`,
      }),
      Decoration.inline(pos + m.index + 1, pos + m.index + 1 + m[1].length, {
        class: url.className,
        nodeName: "a",
        href: m[2],
      }),
      Decoration.inline(
        pos + m.index + 1 + m[1].length,
        pos + m.index + 1 + m[1].length + 2,
        {
          class: `${className}--bracket`,
        }
      ),
      Decoration.inline(
        pos + m.index + 1 + m[1].length + 2,
        pos + m.index + 1 + m[1].length + 2 + m[2].length,
        {
          class: `${className}`,
          nodeName: "input",
          type: "button",
          value: "🔗",
        }
      ),
      Decoration.inline(
        pos + m.index + 1 + m[1].length + 2 + m[2].length,
        pos + m.index + 1 + m[1].length + 2 + m[2].length + 1,
        {
          class: `${className}--bracket`,
        }
      ),
    ];
  },
  commands: {
    "Insert Link": (tr) => {
      return tr
        .replaceSelectionWith(
          schema.nodes.paragraph.create(
            null,
            schema.text(toVisibleSpaces("[<title>](<url>)"))
          )
        )
        .scrollIntoView();
    },
  },
} as ProseDecoration;
