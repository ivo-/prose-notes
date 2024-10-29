import { Fragment } from "prosemirror-model";
import { Command, NodeSelection, TextSelection } from "prosemirror-state";
import { canSplit } from "prosemirror-transform";
import { ProseDecorations } from "./decorations";
import { getTextContent, toVisibleSpaces } from "./utils";

import { className as bulletClassName } from "./decorations/bullet";
import { className as orderedClassName } from "./decorations/ordered";

const RepeatableDecorations = ProseDecorations.filter((D) => D.repeat);

export const splitBlockWithDecorations: Command = (state, dispatch) => {
  let { $from, $to } = state.selection;
  if (
    state.selection instanceof NodeSelection &&
    state.selection.node.isBlock
  ) {
    if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) return false;
    if (dispatch) dispatch(state.tr.split($from.pos).scrollIntoView());
    return true;
  }

  if (!$from.parent.isBlock) return false;

  if (dispatch) {
    let atEnd = $to.parentOffset == $to.parent.content.size;
    let tr = state.tr;
    if (state.selection instanceof TextSelection) tr.deleteSelection();
    let deflt =
      $from.depth == 0
        ? null
        : $from.node(-1).contentMatchAt($from.indexAfter(-1)).defaultType;
    let types = atEnd && deflt ? [{ type: deflt }] : null;
    let can = canSplit(tr.doc, tr.mapping.map($from.pos), 1, types!);
    if (
      !types &&
      !can &&
      canSplit(
        tr.doc,
        tr.mapping.map($from.pos),
        1,
        deflt! && [{ type: deflt! }]
      )
    ) {
      types = [{ type: deflt! }];
      can = true;
    }
    if (can) {
      tr.split(tr.mapping.map($from.pos), 1, types!);
      if (
        !atEnd &&
        !$from.parentOffset &&
        $from.parent.type != deflt &&
        $from
          .node(-1)
          .canReplace(
            $from.index(-1),
            $from.indexAfter(-1),
            Fragment.from($from.parent)
          )
      )
        tr.setNodeMarkup(tr.mapping.map($from.before()), deflt);
    }

    const textContent = getTextContent($from.parent);
    for (const D of RepeatableDecorations) {
      if (!D.repeat) continue;
      const match = textContent.match(D.regex);
      if (!match) continue;

      D.repeat(textContent, match, $from.pos, tr);
      break;
    }

    dispatch(tr.scrollIntoView());
  }
  return true;
};

// const isWithinNode = (
//   className: string,
//   state: EditorState,
//   view: EditorView
// ) => {
//   const { $from, to } = state.selection;
//   const same = $from.sharedDepth(to);
//   if (same == 0) return false;

//   const proseNode = $from.before(same);
//   const currentNode = view.nodeDOM(proseNode);
//   return currentNode.classList.contains(className) && currentNode;
// };

export const killLine: Command = (state, dispatch) => {
  if (!dispatch) return false;

  const { $from, to } = state.selection;
  const same = $from.sharedDepth(to);
  if (same == 0) return false;
  const pos = $from.before(same);

  dispatch(
    state.tr
      .setSelection(NodeSelection.create(state.doc, pos))
      .deleteSelection()
      .scrollIntoView()
  );

  return true;
};

export const cloneLine: Command = (state, dispatch) => {
  const { schema } = state;
  const { $from, to } = state.selection;
  const same = $from.sharedDepth(to);
  if (same == 0) return false;
  const pos = $from.before(same);
  const nodeSel = NodeSelection.create(state.doc, pos);

  const { tr } = state;
  tr.insert(
    nodeSel.to,
    schema.nodes.paragraph.create(null, schema.text(nodeSel.node.textContent))
  );
  tr.scrollIntoView();

  if (dispatch) dispatch(tr);

  // NOTE: select next Node.
  // tr.setSelection(NodeSelection.create(tr.doc, $from.after(same)));

  return true;
};

export const indentList: Command = (state, _, view) => {
  if (!view) return false;

  const { $from, to } = state.selection;
  const same = $from.sharedDepth(to);
  if (same == 0) return false;

  const proseNode = $from.before(same);
  const currentNode = view.nodeDOM(proseNode) as HTMLElement;

  debugger;
  if (!currentNode) return false;

  const item =
    currentNode.querySelector(`.${bulletClassName}`) ||
    currentNode.querySelector(`.${orderedClassName}`);
  if (!item) return false;

  item.textContent = toVisibleSpaces(`    ${item.textContent}`);
  return true;
};

export const unindentList: Command = (state, _, view) => {
  if (!view) return false;

  const { $from, to } = state.selection;
  const same = $from.sharedDepth(to);
  if (same == 0) return false;

  const proseNode = $from.before(same);
  const currentNode = view.nodeDOM(proseNode) as HTMLElement;

  if (!currentNode) return false;

  const item: HTMLElement | null =
    currentNode.querySelector(`.${bulletClassName}`) ||
    currentNode.querySelector(`.${orderedClassName}`);

  if (!item) return false;

  item.textContent = toVisibleSpaces(
    getTextContent(item).replace(/^\s{1,4}/, "")
  );
  return true;
};
