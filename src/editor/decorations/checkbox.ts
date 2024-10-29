import { Decoration } from "prosemirror-view";
import { DECORATION_TYPE_INLINE, ProseDecoration } from "../types";
import {
  DECORATION_CLASS_PREFIX,
  GLOBAL_HIDDEN_CLASS_NAME,
} from "../constants";
import { preventMouseDown } from "../utils";
import Sound from "../../sound";

export const className = `${DECORATION_CLASS_PREFIX}--checkbox`;
export const checkedClassName = `${className}--checked`;

export const CHECKED_VALUE = "+";
export const UNCHECKED_VALUE = "-";

export const DATASET_KEY_CHECKED = "checked";
export const DATASET_KEY_POSITION = "pos";

export default {
  name: "checkbox",
  type: DECORATION_TYPE_INLINE,
  regex: /(\s|^)\[(\+|-)\](?=\s|$)/gi,
  excludedInTable: true,
  className,
  widget: (m, pos) => {
    const start = pos + m.index + m[1].length;
    const end = pos + m.index + m[0].length;
    const isChecked = m[2] === CHECKED_VALUE;

    return [
      Decoration.widget(
        end,
        () => {
          const dom = document.createElement("span");
          dom.onmousedown = preventMouseDown;
          dom.className = `${className} ${isChecked ? checkedClassName : ""}`;
          dom.dataset[DATASET_KEY_POSITION] = String(start);
          dom.dataset[DATASET_KEY_CHECKED] = String(isChecked);

          return dom;
        },
        {
          key: "checkbox-" + start + isChecked,
          side: -1,
        }
      ),
      Decoration.inline(start, end, {
        class: GLOBAL_HIDDEN_CLASS_NAME,
      }),
    ];
  },
  onClickHandlers: {
    [className]: (_, elm, view) => {
      const pos = Number(elm.dataset[DATASET_KEY_POSITION]);
      if (!pos) return;

      Sound.click();
      view.dispatch(
        view.state.tr.insertText(
          elm.dataset[DATASET_KEY_CHECKED] === "false"
            ? CHECKED_VALUE
            : UNCHECKED_VALUE,
          pos + 1,
          pos + 2
        )
      );
    },
  },
} as ProseDecoration;
