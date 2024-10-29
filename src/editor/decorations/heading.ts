import { EditorView, Decoration } from "prosemirror-view";
import { EditorState, Transaction, Selection } from "prosemirror-state";

import { classNameOpening, classNameClosing } from "./heading-folded";
import { DECORATION_TYPE_NODE, ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX, PROSE_MIRROR_CLASS_NAME } from "../constants";
import { getTextContent, preventMouseDown } from "../utils";
import Sound from "../../sound";

export const getHeaderRegex = () => /^(#{1,5})\s.*$/gi;

export function isHeading(str: string) {
  return getHeaderRegex().test(str);
}

export const className = `${DECORATION_CLASS_PREFIX}--heading`;
export const classNameHidden = `${className}--hidden`;
export const classNameWidget = `${className}--widget`;

export default {
  name: "heading",
  type: DECORATION_TYPE_NODE,
  regex: getHeaderRegex(),
  className,
  widget: (m, pos, node) => {
    const level = m[1].length;
    const startOfText = pos + m.index + 1;

    return [
      Decoration.node(pos + m.index, pos + m.index + node.nodeSize, {
        class: `${className} ${className}--${m[1].length}`,
      }),

      Decoration.inline(startOfText, startOfText + level, {
        class: classNameHidden,
      }),

      Decoration.widget(
        startOfText,
        () => {
          const dom = document.createElement("span");
          dom.onmousedown = preventMouseDown;
          dom.classList.add(classNameWidget);

          return dom;
        },
        {
          key: "h1" + pos,
          ignoreSelection: false,
          side: 1,
        }
      ),
    ];
  },
  onClickHandlers: {
    [classNameWidget]: (_, elm) => {
      Sound.click();

      if (!elm.parentNode) return;
      const text = getTextContent(elm.parentNode as HTMLElement);
      const m = text.match(/^(#+)(.+)/i);

      if (!m || m.length === 0) return;
      const level = m[1];

      if (elm.parentElement) {
        elm.parentElement.innerHTML =
          level.length === 5 ? `#${m[2]}` : `#${level}${m[2]}`;
      }
    },
  },

  keyBindings: {
    Tab: toggleHeader,
    "Alt-ArrowDown": (state, dispatch, view) => {
      if (!view || !dispatch) return false;

      selectHeader("nextElementSibling", state, dispatch, view);

      return true;
    },
    "Alt-ArrowUp": (state, dispatch, view) => {
      if (!view || !dispatch) return false;

      selectHeader("previousElementSibling", state, dispatch, view);

      return true;
    },
  },
} as ProseDecoration;

export function toggleHeader(
  state: EditorState,
  _dispatch: (tr: Transaction) => void,
  view: EditorView
) {
  if (!view) return false;
  const { $from, to } = state.selection;
  const same = $from.sharedDepth(to);
  if (same == 0) return false;

  const proseNode = $from.before(same);
  const currentHeader = view.nodeDOM(proseNode) as HTMLElement;

  if (!currentHeader.classList.contains(className)) return false;

  let next = currentHeader;
  let nextHeader = null;
  while (
    next.nextElementSibling &&
    (next = next.nextElementSibling as HTMLElement)
  ) {
    if (next.classList.contains(className)) {
      nextHeader = next;
      break;
    }
  }

  if (currentHeader.nextElementSibling === nextHeader) return false;

  let firstBetween = currentHeader.nextElementSibling;
  let lastBetween = nextHeader ? nextHeader.previousElementSibling : next;
  if (
    firstBetween?.classList.contains(classNameOpening) &&
    lastBetween?.classList.contains(classNameClosing)
  ) {
    currentHeader.parentElement?.removeChild(firstBetween);
    currentHeader.parentElement?.removeChild(lastBetween);

    return true;
  }

  const opening = document.createElement("p");
  const closing = document.createElement("p");

  opening.textContent = ".....";
  closing.textContent = ".....";

  currentHeader.parentElement?.insertBefore(opening, firstBetween);
  if (nextHeader) {
    currentHeader.parentElement?.insertBefore(closing, nextHeader);
  } else {
    currentHeader.parentElement?.appendChild(closing);
  }

  return true;
}

// =============================================================================
// Headers navigation

function selectHeader(
  prop: keyof HTMLElement,
  state: EditorState,
  dispatch: (tr: Transaction) => void,
  view: EditorView
) {
  const { $from, to } = state.selection;
  const same = $from.sharedDepth(to);
  if (same == 0) return false;

  const proseNode = $from.before(same);
  let currentNode = view.nodeDOM(proseNode) as HTMLElement;

  while (
    !currentNode.parentElement?.classList.contains(PROSE_MIRROR_CLASS_NAME)
  ) {
    currentNode = currentNode.parentElement!;
  }

  let next = currentNode;
  while ((next = next[prop] as HTMLElement)) {
    if (next.classList.contains(className)) {
      next.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: "smooth",
      });
      const pos = view.posAtDOM(next, 0);
      let offset = 0;
      if (next.classList.contains(`${className}--1`)) offset = 3;
      else if (next.classList.contains(`${className}--2`)) offset = 4;
      else if (next.classList.contains(`${className}--3`)) offset = 5;
      else if (next.classList.contains(`${className}--4`)) offset = 6;
      else if (next.classList.contains(`${className}--4`)) offset = 7;

      dispatch(
        view.state.tr.setSelection(
          Selection.near(view.state.doc.resolve(pos + offset), -1)
        )
      );
      return true;
    }
  }

  return true;
}
