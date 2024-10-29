import { toVisibleSpaces } from "../utils";
import { DECORATION_TYPE_INLINE, ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";

export const className = `${DECORATION_CLASS_PREFIX}--ordered`;
export default {
  name: "ordered",
  type: DECORATION_TYPE_INLINE,
  regex: /^\s*(\d+)\.\s/gi,
  className,
  repeat: (lineText, match, pos, tr) => {
    if (match[0].trim() === lineText.trim()) {
      tr.delete(pos - lineText.length, pos + lineText.length);
    } else {
      const text = match[0].replace(
        /(\s*|^)(\d+)/,
        (_, s, v) => `${s}${v * 1 + 1}`
      );
      tr.insertText(toVisibleSpaces(text));
    }
  },
} as ProseDecoration;
