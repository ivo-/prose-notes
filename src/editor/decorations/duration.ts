import { Decoration } from "prosemirror-view";
import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { preventMouseDown } from "../utils";
import { isTableRow } from "./table-row";

export const className = `${DECORATION_CLASS_PREFIX}--duration`;
export const buttonClassName = `${className}--button`;
export default {
  name: "duration",
  type: "inline",
  regex: /\b(\d\d?[hms])(\d\d?[ms])?(\d\d?s)?\b/gi,
  className,
  widget: (m, pos, node) => {
    const isInTableRow = isTableRow(String(node.text));
    return [
      ...(isInTableRow
        ? []
        : [
            Decoration.widget(
              pos + m.index,
              () => {
                const dom = document.createElement("input");
                dom.type = "button";
                dom.onmousedown = preventMouseDown;
                dom.value = "▼";
                dom.classList.add(buttonClassName);

                return dom;
              },
              {
                key: "duration" + m[0],
                side: -1,
              }
            ),
          ]),
      Decoration.inline(pos + m.index, pos + m.index + m[0].length, {
        class: className,
      }),
    ];
  },
} as ProseDecoration;

// decorationsHandlers["duration--button"] = (e, elm, view) => {
//   blurOnTouchScreens();

//   const pos = elm.dataset["pos"] * 1;
//   const text = getTextContent(elm.nextElementSibling);
//   const match = parseDuration(text);

//   const overlay = document.createElement("div");
//   overlay.classList.add("duration---overlay");

//   const menu = document.createElement("div");
//   menu.classList.add("duration--menu");
//   ReactDOM.render(<WidgetDuration {...{ view, pos, match, text }} />, menu);

//   overlay.addEventListener("click", (e) => {
//     if (overlay.parentNode) {
//       overlay.parentNode.removeChild(overlay);
//     }
//   });

//   overlay.appendChild(menu);
//   document.body.appendChild(overlay);

//   createPopper(elm, menu, { placement: "bottom-start" });
// };

// const clickDurationButton = (state: EditorState, view: EditorView) => {
//   const { $from, to } = state.selection;
//   const same = $from.sharedDepth(to);
//   if (same == 0) return false;

//   const proseNode = $from.before(same);
//   const currentNode = view.nodeDOM(proseNode) as HTMLElement;

//   const durationButton = currentNode?.querySelector(
//     ".duration--button"
//   ) as HTMLButtonElement;
//   if (!durationButton) return false;
//   durationButton.click();
//   return true;
// };
// export const durationStart: Command = (state, _, view) => {
//   if (clickDurationButton(state, view!)) {
//     (
//       document.querySelector("#duration--countdown") as HTMLButtonElement
//     ).click();
//     return true;
//   }
//   return false;
// };
// export const durationContinue: Command = (state, _, view) => {
//   if (clickDurationButton(state, view!)) {
//     (
//       document.querySelector("#duration--continue") as HTMLButtonElement
//     ).click();
//     return true;
//   }
//   return false;
// };
// export const durationDouble: Command = (state, _, view) => {
//   if (clickDurationButton(state, view!)) {
//     (document.querySelector("#duration--double") as HTMLButtonElement).click();
//     return true;
//   }
//   return false;
// };
