import schema from "../schema";
import { toVisibleSpaces } from "../utils";
import { DECORATION_TYPE_INLINE, ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";

export const className = `${DECORATION_CLASS_PREFIX}--quote`;

export default {
  name: "quote",
  type: DECORATION_TYPE_INLINE,
  regex: /^>\s/gi,
  className,
  repeat: (lineText, match, pos, tr) => {
    if (match[0].trim() === lineText.trim()) {
      tr.delete(pos - lineText.length, pos + lineText.length);
    } else {
      tr.insertText(toVisibleSpaces(match[0]));
    }
  },
  commands: {
    "Insert Quote": (tr) => {
      return tr
        .replaceSelectionWith(
          schema.nodes.paragraph.create(
            null,
            schema.text(toVisibleSpaces("> "))
          )
        )
        .scrollIntoView();
    },
  },
} as ProseDecoration;
