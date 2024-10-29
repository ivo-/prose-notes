import { Decoration } from "prosemirror-view";
import { ProseDecoration } from "../types";
import { DECORATION_CLASS_PREFIX } from "../constants";
import { toVisibleSpaces } from "../utils";
import Sound from "../../sound";

export const checkedSign = "+";
export const uncheckedSign = "-";

export const className = `${DECORATION_CLASS_PREFIX}--todo`;
export const checkedClassName = `${className}--checked`;

export default {
  name: "todo",
  type: "inline",
  regex: /^(-|\+)\s/gi,
  className,
  repeat: (lineText, match, pos, tr) => {
    if (match[0].trim() === lineText.trim()) {
      tr.delete(pos - lineText.length, pos + lineText.length);
    } else {
      tr.insertText(toVisibleSpaces(`${uncheckedSign} `));
    }
  },
  widget: (m, pos) => {
    const sign = m[1];
    const decos = [
      Decoration.inline(pos + m.index, pos + m.index + m[0].length - 1, {
        style: "display: none;",
      }),
      Decoration.inline(
        pos + m.index + m[0].length - 1,
        pos + m.index + m[0].length,
        {
          class: `${className} ${sign === checkedSign ? checkedClassName : ""}`,
          nodeName: "span",
          "data-pos": String(pos + m.index),
          "data-checked": String(sign === checkedSign),
        }
      ),
    ];
    // const currentNode = doc.resolve(pos).node();
    // const nodeBefore = doc.resolve(pos - 1).nodeBefore;
    // const nodeAfter =
    //   doc.content.size <= pos + currentNode.nodeSize
    //     ? null
    //     : doc.resolve(pos + currentNode.nodeSize).node();

    // // NOTE: Todo widget should be applied right next to the first Todo
    // // item in the group.
    // const todoRegEx = /(\+|-)\s/;
    // if (
    //   (!nodeBefore || !todoRegEx.test(getTextContent(nodeBefore).slice(0, 2))) &&
    //   nodeAfter &&
    //   todoRegEx.test(getTextContent(nodeAfter).slice(0, 2))
    // ) {
    //   decos.push(
    //     Decoration.widget(pos + m.index, (view) => WidgetTodo(view), {
    //       key: getTextContent(currentNode),
    //     })
    //   );
    // }

    return decos;
  },
  onClickHandlers: {
    [className]: (_, elm, view) => {
      if (!elm.dataset["pos"]) return;

      const pos = Number(elm.dataset["pos"]);
      view.dispatch(
        view.state.tr.insertText(
          elm.dataset["checked"] === "false" ? checkedSign : uncheckedSign,
          pos,
          pos + 1
        )
      );

      Sound.click();
    },
  },

  keyBindings: {
    // Toggle
    Tab: (state, dispatch, view) => {
      if (!view || !dispatch) return false;

      const { $from, to } = state.selection;
      const same = $from.sharedDepth(to);
      if (same == 0) return false;

      const proseNode = $from.before(same);
      const domNode = view.nodeDOM(proseNode) as HTMLElement;
      if (!domNode) return false;
      const todoNode = domNode.querySelector(`.${className}`) as HTMLElement;
      if (!todoNode) return false;
      todoNode.click();
      return true;
    },

    // Reset
    "Ctrl-i": (state, dispatch, view) => {
      if (!view || !dispatch) return false;

      const { $from, to } = state.selection;
      const same = $from.sharedDepth(to);
      if (same == 0) return false;

      const proseNode = $from.before(same);
      const domNode = view.nodeDOM(proseNode) as HTMLElement;
      if (!domNode) return false;
      const todoNode = domNode.querySelector(`.${className}`) as HTMLElement;
      if (!todoNode) return false;

      const nodes: HTMLElement[] = [];
      let node = domNode;
      while (
        node.previousElementSibling &&
        node.previousElementSibling.querySelector(`.${className}`)
      ) {
        node = node.previousElementSibling as HTMLElement;
        nodes.push(node);
      }

      while (
        node.nextElementSibling &&
        node.nextElementSibling.querySelector(`.${className}`)
      ) {
        node = node.nextElementSibling as HTMLElement;
        nodes.push(node);
      }

      nodes.forEach((node) => {
        (node.querySelector(`.${checkedClassName}`) as HTMLElement)?.click();
      });

      return true;
    },
  },
} as ProseDecoration;
