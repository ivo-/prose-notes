import { DECORATION_TYPE_NODE, ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";

export const className = `${DECORATION_CLASS_PREFIX}--hr`;
export default {
  name: "hr",
  type: DECORATION_TYPE_NODE,
  regex: /^---$/gi,
  className,
} as ProseDecoration;
