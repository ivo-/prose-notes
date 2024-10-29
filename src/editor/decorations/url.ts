import { Decoration } from "prosemirror-view";
import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";

export const className = `${DECORATION_CLASS_PREFIX}--url`;
export default {
  name: "url",
  type: "inline",
  regex: /([^\S]|^)(((https?:\/\/)|(www\.))(\S+))/gi,
  className,
  widget: (m, pos, node) => {
    return [
      Decoration.inline(
        pos + m.index + m[1].length,
        pos + m.index + m[0].length,
        {
          class: className,
          nodeName: "a",
          href: node.text,
          title: node.text,
        }
      ),
    ];
  },
  onClickHandlers: {
    [className]: (e, elm) => {
      if ((e.metaKey || e.altKey) && elm.nodeName.toLowerCase() === "a") {
        window.open((elm as HTMLAnchorElement).href, "_blank");
      }
    },
  },
} as ProseDecoration;
