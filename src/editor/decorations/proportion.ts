import { Decoration } from "prosemirror-view";
import { DECORATION_TYPE_INLINE, ProseDecoration } from "../types";
import {
  DECORATION_CLASS_PREFIX,
  GLOBAL_HIDDEN_CLASS_NAME,
} from "../constants";
import { getTextContent, toVisibleSpaces, preventMouseDown } from "../utils";
import Sound from "../../sound";

export const className = `${DECORATION_CLASS_PREFIX}--proportion`;
export const leftClassName = `${className}--left`;
export const rightClassName = `${className}--right`;
export const PROPORTION_DELIMITER = "/";

export default {
  name: "proportion",
  type: DECORATION_TYPE_INLINE,
  regex: /(\s|^)\[(\d+)\/(\d+)\](?=\s|$)/gi,
  className,
  excludedInTable: true,
  widget: (m, pos) => {
    const start = pos + m.index + m[1].length;
    const end = pos + m.index + m[0].length;

    return [
      Decoration.widget(
        start,
        () => {
          const dom = document.createElement("span");
          dom.onmousedown = preventMouseDown;
          dom.classList.add(leftClassName);
          dom.dataset.pos = String(start);

          return dom;
        },
        {
          key: "proportion-start-" + m[0],
          side: 1,
        }
      ),
      Decoration.widget(
        end,
        () => {
          const dom = document.createElement("span");
          dom.onmousedown = preventMouseDown;
          dom.classList.add(rightClassName);
          dom.dataset.pos = String(start);

          return dom;
        },
        {
          key: "proportion-end-" + m[0],
          side: -1,
        }
      ),
      Decoration.inline(start, start + 1, {
        class: GLOBAL_HIDDEN_CLASS_NAME,
      }),
      Decoration.inline(start + 1, end - 1, {
        class: className,
      }),
      Decoration.inline(end - 1, end, {
        class: GLOBAL_HIDDEN_CLASS_NAME,
      }),
    ];
  },
  commands: {
    "Insert Quantity": (tr) => {
      return tr
        .insertText(toVisibleSpaces(`[0${PROPORTION_DELIMITER}10]`))
        .scrollIntoView();
    },
  },
  onClickHandlers: {
    [leftClassName]: (_, elm, view) => {
      Sound.click();

      if (!elm.dataset["pos"]) return;
      const pos = Number(elm.dataset["pos"]);

      const numElm = elm.nextElementSibling?.nextElementSibling;
      if (!numElm) return;
      const m = getTextContent(numElm as HTMLElement).split(
        PROPORTION_DELIMITER
      );

      view.dispatch(
        view.state.tr.insertText(
          `[${Math.max(Number(m[0]) - 1, 0)}${m[1] ? `${PROPORTION_DELIMITER}${m[1]}` : ""}]`,
          pos,
          pos + m.join(PROPORTION_DELIMITER).length + 2
        )
      );
    },

    [rightClassName]: (_, elm, view) => {
      Sound.click();

      if (!elm.dataset["pos"]) return;
      const pos = Number(elm.dataset["pos"]);

      const numElm = elm.previousElementSibling?.previousElementSibling;
      if (!numElm) return;
      const m = getTextContent(numElm as HTMLElement).split(
        PROPORTION_DELIMITER
      );

      view.dispatch(
        view.state.tr.insertText(
          `[${Math.min(Number(m[0]) + 1, m[1] ? Number(m[1]) : Infinity)}${
            m[1] ? `${PROPORTION_DELIMITER}${m[1]}` : ""
          }]`,
          pos,
          pos + m.join(PROPORTION_DELIMITER).length + 2
        )
      );
    },
  },
} as ProseDecoration;
