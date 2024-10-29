import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { blurOnTouchScreens } from "../utils";

export const className = `${DECORATION_CLASS_PREFIX}--opened`;
export const classNameOpening = `${className}--opening`;
export const classNameClosing = `${className}--closing`;
export default {
  name: "opened",
  type: "multi-node",
  regex: /^(\.\.\.\.)[^\.]*$/gi,
  className,
  onClickHandlers: {
    [`${classNameOpening}`]: (_, elm) => {
      elm.textContent = `...${elm.textContent?.replace(/^\.+/, "")}`;

      const closing = elm.parentElement?.querySelector(`.${classNameClosing}`);
      if (closing) {
        closing.textContent = `...${closing.textContent?.replace(/^\.+/, "")}`;
      }

      blurOnTouchScreens();
    },
  },
} as ProseDecoration;
