import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { genInlineDecorationRegex } from "../utils";

export default {
  name: "italic",
  char: "/",
  type: "inline",
  regex: genInlineDecorationRegex("/"),
  className: `${DECORATION_CLASS_PREFIX}--italic is-italic`,
} as ProseDecoration;
