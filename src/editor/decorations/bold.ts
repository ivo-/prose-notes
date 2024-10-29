import { DECORATION_TYPE_INLINE, ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { genInlineDecorationRegex } from "../utils";

export const className = `${DECORATION_CLASS_PREFIX}--bold`;

export default {
  name: "bold",
  char: "*",
  type: DECORATION_TYPE_INLINE,
  regex: genInlineDecorationRegex("*"),
  className,
} as ProseDecoration;
