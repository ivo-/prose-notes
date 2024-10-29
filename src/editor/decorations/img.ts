import { Decoration } from "prosemirror-view";
import { ProseDecoration } from "../types";
import { preventMouseDown } from "../utils";
import { DECORATION_CLASS_PREFIX } from "../constants";

export const className = `${DECORATION_CLASS_PREFIX}--img`;
export default {
  name: "img",
  type: "inline",
  regex: /!\[(https:\/\/[^\]]+|[^\]]+)\]/gi,
  className,
  widget: (m, pos) => {
    return [
      Decoration.inline(pos + m.index, pos + m.index + 1, {
        style: "opacity: 0;",
      }),
      Decoration.inline(pos + m.index + 1, pos + m.index + m[0].length, {
        style: "display: none;",
        contentEditable: "false",
      }),

      Decoration.widget(
        pos + m.index + 1,
        () => {
          const dom = document.createElement("img");
          dom.onmousedown = preventMouseDown;
          dom.src = m[1];
          dom.classList.add(className);

          return dom;
        },
        {
          key: "img" + m[1],
          ignoreSelection: false,
          side: -1,
        }
      ),
    ];
  },
} as ProseDecoration;
