import { Decoration } from "prosemirror-view";
import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { isTableRow } from "./table-row";
// import { preventMouseDown } from "../utils";

const className = `${DECORATION_CLASS_PREFIX}--datetime`;
export default {
  name: "datetime",
  type: "inline",
  regex: /\b(\d\d\d\d)-(\d\d)-(\d\d)(:?\s(\d\d):(\d\d))?\b/gi,
  className,
  widget: (m, pos, node) => {
    const isInTableRow = isTableRow(String(node.text));
    return [
      ...(isInTableRow
        ? []
        : [
            /* Decoration.widget(
              pos + m.index,
              () => {
                const dom = document.createElement("input");
                dom.type = "button";
                dom.onmousedown = preventMouseDown;
                dom.value = "▼";
                dom.classList.add(`${className}--button`);

                // "data-startpos": String(pos + m.index),
                // "data-endpos": String(pos + m.index + m[0].length),

                return dom;
              },
              {
                key: "duration" + m[0],
                side: -1,
              }
            ), */
          ]),
      Decoration.inline(pos + m.index, pos + m.index + m[0].length, {
        class: className,
      }),
    ];
  },
} as ProseDecoration;

// decorationsHandlers["date--button"] = (e, elm, view) => {
//   blurOnTouchScreens();

//   const startPos = elm.dataset["startpos"] * 1;
//   const endPos = elm.dataset["endpos"] * 1;
//   const selected = getTextContent(elm.nextElementSibling);

//   showPopup({
//     size: "mini",
//     basic: true,
//     closeIcon: false,
//     content: (
//       <DatePicker
//         selected={selected}
//         onSelect={(date) => {
//           view.dispatch(view.state.tr.insertText(" " + date, startPos, endPos));
//           hidePopup();
//         }}
//       />
//     ),
//   });
// };
