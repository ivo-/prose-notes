import { Decoration } from "prosemirror-view";
import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";

export default {
  name: "tag",
  type: "inline",
  regex: /(\s|^)#[^\b\s#\-_`]+/gi,
  className: `${DECORATION_CLASS_PREFIX}--tag`,
  widget: (m, pos) => {
    return [
      Decoration.inline(
        pos + m.index + m[1].length,
        pos + m.index + m[0].length,
        {
          class: `${DECORATION_CLASS_PREFIX}--tag tag is-primary`,
        }
      ),
    ];
  },
} as ProseDecoration;
