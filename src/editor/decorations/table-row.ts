import schema from "../schema";
import { EditorView } from "prosemirror-view";
import { TextSelection } from "prosemirror-state";
import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { getTextContent, toVisibleSpaces } from "../utils";

export const className = `${DECORATION_CLASS_PREFIX}--table-row`;
export const isTableRow = (str: string) => /^\|(?:\s|-|=).*$/gi.test(str);

export default {
  name: "table-row",
  type: "node",
  regex: /^\|(?:\s|-|=).*$/gi,
  className,
  repeat: (lineText, _, pos, tr) => {
    if (lineText === "| ") {
      tr.delete(pos - lineText.length, pos + lineText.length);
    } else {
      tr.insertText(toVisibleSpaces("| "));
    }
  },
  commands: {
    "Insert Table": (tr) => {
      return tr
        .replaceSelectionWith(
          schema.nodes.paragraph.create(
            null,
            schema.text(toVisibleSpaces("|   |"))
          )
        )
        .scrollIntoView();
    },
  },
  menuOptions: [
    {
      name: "Sort",
      handler: () => {
        alert("Sort");
      },
    },
  ],
  keyBindings: {
    Tab: (state, dispatch, view) => {
      if (!view || !dispatch) return false;

      const domNodes = getTableDomNodes(view);
      if (!domNodes) return false;

      const rows = domNodes.map((n) => getTextContent(n));

      const { $from, to } = state.selection;
      const same = $from.sharedDepth(to);
      const proseNode = $from.before(same);
      const currentNode = view.nodeDOM(proseNode) as HTMLElement;

      const [result, nextSelectedRow, nextSelectedCell] = getFormattedTable(
        rows,
        domNodes.indexOf(currentNode),
        $from.pos - proseNode - 1
      );

      if (result.length === 0) return false;
      if (rows.join() !== result.join()) {
        domNodes.forEach((node, i) => {
          const text = toVisibleSpaces(result[i]);
          node.textContent = text;
        });
      }

      setTimeout(() => {
        // Wait for prosemirror to update itself, request the new nodes and set the selection.
        const updatedNodes = getTableDomNodes(view);
        if (!updatedNodes) return;
        const node = updatedNodes[nextSelectedRow];
        const pos = view.posAtDOM(node, 0);
        const tr = view.state.tr;

        let posInCell = result[nextSelectedRow]
          .split("|")
          .slice(0, nextSelectedCell + 2)
          .join("|")
          .trim().length;

        dispatch(
          tr.setSelection(
            TextSelection.create(tr.doc, pos + posInCell, pos + posInCell)
          )
        );
      }, 1);

      return true;
    },
  },
} as ProseDecoration;

function getTableDomNodes(view: EditorView) {
  const { $from, to } = view.state.selection;
  const same = $from.sharedDepth(to);
  if (same == 0) return false;

  const proseNode = $from.before(same);
  const currentNode = view?.nodeDOM(proseNode) as HTMLElement;
  const domNodes = [currentNode];

  if (!currentNode.classList.contains(className)) return false;

  let next = currentNode;
  while (
    (next = next.nextElementSibling as HTMLElement) &&
    next.classList.contains(className)
  ) {
    domNodes.push(next);
  }

  let prev = currentNode;
  while (
    (prev = prev.previousElementSibling as HTMLElement) &&
    prev.classList.contains(className)
  ) {
    domNodes.unshift(prev);
  }

  return domNodes;
}

function getFormattedTable(
  rows: string[],
  selectedRow: number,
  selectedChar: number
): [string[], number, number] {
  const isLineRow = (row: string) => row.slice(0, 2) === "|-";

  const dataRows = rows
    .filter((row) => !isLineRow(row))
    .map((row) => row.replace(/\s\s*/g, " ").trim().split("|"));

  if (dataRows.length === 0) return [[], 0, 0];

  const separatorRowsIdxs = rows
    .map((row, i) => (isLineRow(row) ? i : null))
    .filter((index) => index !== null) as number[];

  const maxCellsNum = Math.max(...dataRows.map((r) => r.length));
  const table = dataRows.map((row) => {
    const extraEmptyCells = " ".repeat(maxCellsNum - row.length).split(" ");
    return [...row, ...extraEmptyCells];
  });

  for (let i = 0; i < maxCellsNum; i++) {
    const maxWidth = Math.max(...table.map((row) => row[i].length));
    table.forEach((row) => (row[i] = padBothToLength(row[i], maxWidth, " ")));
  }

  const outputTable = table.map(
    (row: string[]) => `| ${row.filter((c) => c !== "").join(" | ")} |`
  );

  const lineRow = [...Array.from(outputTable[0])]
    .map((c) => (c !== "|" ? "-" : c))
    .join("");

  separatorRowsIdxs.forEach((index: number) => {
    outputTable.splice(index, 0, lineRow);
  });

  const selectedCell =
    rows[selectedRow].slice(0, selectedChar).split("|").length - 2;
  const resultCellsLength = outputTable[0].split("|").length - 2;

  let nextSelectedRow = selectedRow;
  let nextSelectedCell = selectedCell + 1;

  if (nextSelectedCell === resultCellsLength) {
    nextSelectedCell = 0;
    do {
      nextSelectedRow += 1;
    } while (separatorRowsIdxs.includes(nextSelectedRow));

    if (!outputTable[nextSelectedRow]) {
      nextSelectedRow = outputTable.findIndex(
        (_, i) => !separatorRowsIdxs.includes(i)
      );
    }
  }

  return [outputTable, nextSelectedRow, nextSelectedCell];
}

function padBothToLength(str: string, toLength: number, padStr = " ") {
  const fromLength = str.length;
  const fromStart = Math.floor((toLength - fromLength) / 2);
  const fromEnd = Math.ceil((toLength - fromLength) / 2);

  return `${padStr.repeat(fromStart)}${str}${padStr.repeat(fromEnd)}`;
}
