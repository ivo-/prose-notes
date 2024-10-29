import { Node } from "prosemirror-model";
import { formatDate as format } from "date-fns/format";
import readingTime from 'reading-time';

export const formatDateTime = (item: { seconds: number }) => {
  return format(item.seconds * 1000, "MMMM Do YYYY, h:mm:ss a");
};

export function getTextContent(n: HTMLElement | Node) {
  return n.textContent?.split("\u00a0").join(" ") as string;
}

export function toVisibleSpaces(text: string) {
  return text.split(" ").join("\u00a0");
}

export function toRealSpaces(text: string) {
  return text.split("\u00a0").join(" ");
}

export function blurOnTouchScreens() {
  const editor = document.querySelector(".ProseMirror") as HTMLElement | null;
  if (!editor) return;

  if (
    "ontouchstart" in window ||
    window.TouchEvent ||
    // @ts-ignore
    (DocumentTouch in window && document instanceof window.DocumentTouch)
  ) {
    editor.blur();
  }
}

export function genInlineDecorationRegex(char: string) {
  return new RegExp(
    `\\${char}(:?[^\\s\\${char}][^\\${char}]*[^\\s\\${char}]|[^\\s\\${char}])\\${char}(?=\\s|$)`,
    "gi"
  );
}

export const parseEditorContent = (content: {
  selection: unknown;
  doc: {
    content: { type: string; content: { type: "text"; text: "string" }[] }[];
  };
}) => {
  let fullText = "";
  content.doc.content.forEach((node) => {
    if (node.type === "paragraph") {
      if (!node.content) {
        fullText += "\n";
      } else {
        const nodeText = node.content.map((c) => c.text).join("");
        fullText += `${nodeText}\n`;
      }
    }
  });

  const headers = Array.from(fullText.matchAll(/^(##*)(\s\s*).*$/gm)).map(
    (m) => ({
      level: m[1].length,
      text: m[0].slice(m[1].length + m[2].length),
    })
  );
  const sections = fullText.split(/^##*\s\s*.*$/m);
  const sectionsTextWithoutCodeBlocks = (() => {
    const codeIdxs = sections.map((s) => {
      return s.split("\n").reduce((res, line, index) => {
        if (line.startsWith("```")) {
          res.push(index);
        }
        return res;
      }, [] as number[]);
    });

    const result = codeIdxs.map((idxs, i) => {
      if (idxs.length < 2) {
        return sections[i];
      }

      let r = sections[i].split("\n");
      for (let i = 0; i + 1 < idxs.length; i += 2) {
        r.splice(idxs[i], idxs[i + 1] - idxs[i] + 1);
      }

      return r.join("\n");
    });

    return result.join("");
  })();

  const tags = Array.from(
    new Set(
      Array.from(
        sectionsTextWithoutCodeBlocks.matchAll(/(\s|^)#([^\b\s#\-_`]+)/gi)
      ).map((m) => m[2])
    )
  );
  const title = headers.length ? headers[0].text : sections[0].split("\n")[0];

  return { title, tags, headers, sections, fullText: toRealSpaces(fullText) };
};

export const getReadingTime = (content: string) => {
  return readingTime(content);
}  

export const preventMouseDown = (e: MouseEvent) => e.preventDefault();
