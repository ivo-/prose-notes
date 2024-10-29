import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { blurOnTouchScreens } from "../utils";

export const className = `${DECORATION_CLASS_PREFIX}--folded`;
export const classNameOpening = `${className}--opening`;
export const classNameClosing = `${className}--closing`;
export default {
  name: "folded",
  type: "multi-node",
  regex: /^(\.\.\.)[^\.]*$/gi,
  className,
  onClickHandlers: {
    [classNameOpening]: (_, elm) => {
      elm.textContent = `....${elm.textContent?.replace(/^\.+/, "")}`;

      let next = elm;
      while (
        next &&
        next.nextElementSibling &&
        (next = next.nextElementSibling as HTMLElement)
      ) {
        if (next.classList.contains(classNameClosing)) {
          next.textContent = `....${next.textContent?.replace(/^\.+/, "")}`;
          break;
        }
      }

      blurOnTouchScreens();
    },
  },
} as ProseDecoration;

// export const foldedToggle: Command = (state, _, view) => {
//   if (!view) return false;
//   const { $from, to } = state.selection;
//   const same = $from.sharedDepth(to);
//   if (same == 0) return false;

//   const proseNode = $from.before(same);
//   const currentNode = view.nodeDOM(proseNode) as HTMLElement;

//   if (currentNode.classList.contains("folded-opening")) {
//     currentNode.innerText = "....";
//     return true;
//   }

//   if (currentNode.querySelector(".toggleFolded")) {
//     currentNode.innerHTML = "...";
//     return true;
//   }

//   return false;
// };
