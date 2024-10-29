import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";

export const className = `${DECORATION_CLASS_PREFIX}--date`;
export default {
  name: "date",
  type: "inline",
  regex: new RegExp(
    "(" +
      //
      "everyday" +
      "|mon-tue" +
      "|mon-wed" +
      "|mon-thu" +
      "|mon-fri" +
      "|mon-sat" +
      "|mon-sun" +
      "|tue-wed" +
      "|tue-thu" +
      "|tue-fri" +
      "|tue-sat" +
      "|tue-sun" +
      "|wed-thu" +
      "|wed-fri" +
      "|wed-sat" +
      "|wed-sun" +
      "|thu-fri" +
      "|thu-sat" +
      "|thu-sun" +
      "|fri-sat" +
      "|fri-sun" +
      "|sat-sun" +
      "|mon" +
      "|tue" +
      "|wed" +
      "|thu" +
      "|fri" +
      "|sat" +
      "|sun" +
      ")" +
      "(:?\\s(\\d\\d):(\\d\\d))?\\b",
    "gi"
  ),
  className,
} as ProseDecoration;
