import { toVisibleSpaces } from "../utils";
import { DECORATION_TYPE_INLINE, ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";

export const className = `${DECORATION_CLASS_PREFIX}--bullet`;
export default {
  name: "bullet",
  type: DECORATION_TYPE_INLINE,
  regex: /^\s*\*\s/gi,
  className,
  repeat: (lineText, match, pos, tr) => {
    if (match[0].trim() === lineText.trim()) {
      tr.delete(pos - lineText.length, pos + lineText.length);
    } else {
      tr.insertText(toVisibleSpaces(match[0]));
    }
  },
} as ProseDecoration;

// =============================================================================
// Lists

// export const indentList: Command = (state, _, view) => {
//   const { $from, to } = state.selection;
//   const same = $from.sharedDepth(to);
//   if (same == 0) return false;

//   const proseNode = $from.before(same);
//   const currentNode = view?.nodeDOM(proseNode) as HTMLElement;

//   const item =
//     currentNode.querySelector(".bullet") ||
//     currentNode.querySelector(".ordered");
//   if (!item) return false;

//   item.textContent = toVisibleSpaces(`    ${item.textContent}`);
//   return true;
// };

// export const unindentList: Command = (state, _, view) => {
//   const { $from, to } = state.selection;
//   const same = $from.sharedDepth(to);
//   if (same == 0) return false;

//   const proseNode = $from.before(same);
//   const currentNode = view?.nodeDOM(proseNode) as HTMLElement;

//   const item = (currentNode.querySelector(".bullet") ||
//     currentNode.querySelector(".ordered")) as HTMLElement;
//   if (!item) return false;

//   item.textContent = toVisibleSpaces(
//     getTextContent(item).replace(/^\s{1,4}/, "")
//   );
//   return true;
// };
