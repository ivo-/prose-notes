import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";

export const className = `${DECORATION_CLASS_PREFIX}--heading--folded`;
export const classNameOpening = `${className}--opening`;
export const classNameClosing = `${className}--closing`;
export default {
  name: "folded",
  type: "multi-node",
  regex: /^(\.\.\.\.\.)$/gi,
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
          break;
        }
      }

      if (next) {
        next.parentElement?.removeChild(next);
      }
      elm.parentElement?.removeChild(elm);
    },
  },
} as ProseDecoration;
