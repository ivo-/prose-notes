import { ProseDecorations } from "./decorations";
import { DECORATION_TYPE_INLINE } from "./types";
import code, { highlightClassName } from "./decorations/code";
import hr from "./decorations/hr";
import quote from "./decorations/quote";
import tag from "./decorations/tag";
import url from "./decorations/url";
import _var from "./decorations/var";
import date from "./decorations/date";
import * as tr from "./decorations/table-row";
import * as heading from "./decorations/heading";
import datetime from "./decorations/datetime";
import duration from "./decorations/duration";

const decorationsToStrip = ProseDecorations.filter(
  (d) => d.type === DECORATION_TYPE_INLINE || d.name === hr.name
);

const inlineDecorationToEmpty = [quote.name, hr.name, _var.name];
const inlineDecorationToSkip = [
  url.name,
  tag.name,
  date.name,
  datetime.name,
  duration.name,
];

export const getPreviewNode = () => {
  // TODO: export as consts.
  const result = document
    .querySelector("#Editor .ProseMirror")
    ?.cloneNode(true) as HTMLElement;

  if (!result) return null;
  result.contentEditable = "false";

  decorationsToStrip.forEach((d) => {
    result.querySelectorAll(`.${d.className}`).forEach((node) => {
      const n = node as HTMLElement;

      if (inlineDecorationToSkip.includes(d.name)) return;
      if (inlineDecorationToEmpty.includes(d.name)) {
        n.innerHTML = "";
        return;
      }

      const isInTableRow = n.parentElement?.classList.contains(tr.className);
      const replacement = isInTableRow ? "\u00a0" : "";

      let content = n.innerHTML;
      if (d.char && content.trim() == d.char) {
        content = content.replace(
          new RegExp(`^\\${d.char}|\\${d.char}$`, "gi"),
          replacement
        );
      } else {
        content = content.replace(d.regex, `${replacement}$1${replacement}`);
      }
      n.innerHTML = content;
    });
  });

  // Code
  result.querySelectorAll(`.${highlightClassName}`).forEach((n) => {
    const node = n as HTMLElement;
    node.style.position = "static";
    node.innerHTML = node.innerHTML.replace(/(^```[^\s]*|```$)/g, "");

    // Move the code block to the parent, as the child will be removed.
    const parent = n.parentElement;
    if (!parent) return;
    parent.parentElement?.insertBefore(n, parent);
  });

  result
    .querySelectorAll(
      `
.${code.className},
.${heading.classNameWidget}
`
    )
    .forEach((n) => {
      n.parentElement?.removeChild(n);
    });

  return result;
};
