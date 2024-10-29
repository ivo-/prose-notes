import { DECORATION_TYPE_INLINE, ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { genInlineDecorationRegex } from "../utils";

export default {
  name: "underline",
  char: "_",
  type: DECORATION_TYPE_INLINE,
  regex: genInlineDecorationRegex("_"),
  className: `${DECORATION_CLASS_PREFIX}--underline is-underlined`,
} as ProseDecoration;
