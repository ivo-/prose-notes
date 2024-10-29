import classNames from "classnames";
import { Fragment, Node } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
/* import { ReplaceStep } from "prosemirror-transform"; */
import { Decoration, DecorationSet } from "prosemirror-view";
import { getTextContent } from "./utils";

import bold from "./decorations/bold";
import bullet from "./decorations/bullet";
import checkbox from "./decorations/checkbox";
import code from "./decorations/code";
import counter from "./decorations/counter";
import date from "./decorations/date";
import datetime from "./decorations/datetime";
import duration from "./decorations/duration";
import folded from "./decorations/folded";
import heading, { isHeading } from "./decorations/heading";
import headingFolded from "./decorations/heading-folded";
import highlight from "./decorations/highlight";
import hr from "./decorations/hr";
import img from "./decorations/img";
import italic from "./decorations/italic";
import link from "./decorations/link";
import opened from "./decorations/opened";
import ordered from "./decorations/ordered";
import proportion from "./decorations/proportion";
import quote from "./decorations/quote";
import strikethrough from "./decorations/strikethrough";
import tableRow, { isTableRow } from "./decorations/table-row";
import tag from "./decorations/tag";
import todo from "./decorations/todo";
import underline from "./decorations/underline";
import url from "./decorations/url";
import variables from "./decorations/var";
import _var from "./decorations/var";

export const ProseDecorations = [
  bold,
  bullet,
  checkbox,
  code,
  counter,
  date,
  datetime,
  duration,
  folded,
  heading,
  headingFolded,
  highlight,
  hr,
  img,
  italic,
  link,
  ordered,
  proportion,
  quote,
  strikethrough,
  tableRow,
  tag,
  todo,
  opened,
  underline,
  url,
  variables,
];

export const InlineDecorations = ProseDecorations.filter(
  (d) => d.type === "inline"
);
export const NodeDecorations = ProseDecorations.filter(
  (d) => d.type === "node"
);
export const MultiNodeDecorations = ProseDecorations.filter(
  (d) => d.type === "multi-node"
);

/**
 * Decorations should not be visible inside specified nodes.
 */
// const excludedNodes: { [key: string]: boolean } = {};
// const nodeName = doc.resolve(pos).node().type.name;
// if (excludedNodes[nodeName]) return;

function getDecorations(doc: Node | Fragment, offset = 0) {
  let decos: Decoration[] = [];
  let openClose: { [key: string]: { node: Node; pos: number } | boolean } = {};
  let executionContext: { [key: string]: unknown } = {};

  const handleNode = (node: Node, pos: number) => {
    const isCodeBlockOpened = openClose[code.name];

    // --------------------------------
    // Handle inline decorations.

    if (node.isText) {
      // No inline decorations inside code blocks!
      if (isCodeBlockOpened) {
        return;
      }

      const isTableRowNode = isTableRow(String(node.text));
      for (const D of InlineDecorations) {
        while (true) {
          let m = D.regex.exec(String(node.text));
          if (!m) break;

          if (D.excludedInTable && isTableRowNode) {
            continue;
          }

          if (D.widget) {
            decos.push(...D.widget(m, pos + offset, node, executionContext));
          } else {
            decos.push(
              Decoration.inline(
                offset + pos + m.index,
                offset +
                  pos +
                  m.index +
                  m[0].length +
                  // XXX: Repeatable decorations usually have extra space.
                  (D.repeat ? -1 : 0),
                {
                  class: D.className,
                }
              )
            );
          }
        }
      }

      return;
    }

    // --------------------------------
    // Handle node decorations.

    const nodeText = getTextContent(node);
    if (!isCodeBlockOpened) {
      for (const D of NodeDecorations) {
        while (true) {
          let m = D.regex.exec(nodeText);
          if (!m) break;

          if (D.widget) {
            decos.push(...D.widget(m, pos + offset, node, executionContext));
          } else {
            decos.push(
              Decoration.node(
                offset + pos + m.index,
                offset + pos + m.index + node.nodeSize,
                {
                  class: D.className,
                }
              )
            );
          }
        }
      }
    }

    // --------------------------------
    // Handle multi-node decorations.

    // NOTE: Every heading resets `openClose` pairs unless part of a code block.
    if (isHeading(nodeText) && !isCodeBlockOpened) {
      openClose = {};
    }

    for (const D of MultiNodeDecorations) {
      while (true) {
        let m = D.regex.exec(getTextContent(node));
        if (!m) break;

        if (!openClose[D.name] && !isCodeBlockOpened) {
          openClose[D.name] = { node, pos };
          continue;
        }

        if (openClose[D.name]) {
          const closing = { node, pos };
          const opening = openClose[D.name];

          if (typeof opening === "boolean") {
            continue;
          }

          const textContent: string[] = [];

          doc.nodesBetween(opening.pos, closing.pos + 1, (n, p) => {
            if (n.isText) return;
            textContent.push(getTextContent(n));

            decos.push(
              Decoration.node(offset + p, offset + p + n.nodeSize, {
                class: classNames(
                  D.className,
                  p === opening.pos && `${D.className}--opening`,
                  p === closing.pos && `${D.className}--closing`
                ),
              })
            );
          });

          delete openClose[D.name];

          if (D.widget) {
            decos.push(
              ...D.widget(
                textContent as RegExpExecArray,
                offset + opening.pos + 1,
                node,
                executionContext
              )
            );
          }
        }
      }
    }
  };

  doc.descendants(handleNode);

  return decos;
}

// =============================================================================
// Plugin

export default new Plugin({
  state: {
    init(_, { doc }) {
      return DecorationSet.create(doc, getDecorations(doc));
    },
    apply(tr, decorationsSet) {
      // TODO: When inside some decoration => do stuff
      // const pos = tr.selection.from;
      // const [deco] = decorationsSet.find(pos, pos);
      // if (deco) {
      //   // @ts-ignore Type actually exits for a decoration.
      //   const className = deco.type.attrs.class;
      //   if (className.indexOf(_var.className) !== -1) {
      //     debugger;
      //     document.body.style.background = "red";
      //   }
      // } else {
      //   document.body.style.background = "";
      // }

      // decorationsSet.add()
      // => keep state and remove the previous cursor.

      if (!tr.docChanged) return decorationsSet;

      // const { steps } = tr;
      // const firstStep = steps[0];
      // if (steps.length === 1 && firstStep instanceof ReplaceStep) {
      //   const paragraphs: [Node, number][] = [];
      //   tr.doc.descendants((n, p) => {
      //     if (n.type.name === "paragraph") paragraphs.push([n, p]);
      //   });

      //   let fromRange: number = 0;
      //   let toRange: number = tr.doc.nodeSize - 2;
      //   for (const [n, pos] of paragraphs) {
      //     if (pos > firstStep.to) {
      //       if (isHeading(n.textContent)) {
      //         // toRange = pos - 2;
      //         break;
      //       }
      //     }

      //     if (pos <= firstStep.from) {
      //       if (isHeading(n.textContent)) {
      //         fromRange = pos;
      //       }

      //       toRange = pos + n.nodeSize;
      //     }
      //   }

      //   let diffParagraphs = paragraphs.filter(
      //     ([, pos]) => pos >= fromRange && pos <= toRange
      //   );
      //   if (
      //     isHeading(diffParagraphs[diffParagraphs.length - 1][0].textContent)
      //   ) {
      //     diffParagraphs = diffParagraphs.slice(0, -1);
      //   }

      //   const diffFragment = Fragment.from(
      //     diffParagraphs.map(([node]) => node)
      //   );
      //   const decosToAdd = getDecorations(diffFragment, diffParagraphs[0][1]);
      //   const decosToRemove = decorationsSet.find(fromRange, toRange);

      //   // Debug:
      //   console.log(
      //     "fromRange",
      //     fromRange,
      //     "toRange",
      //     toRange,
      //     decosToAdd,
      //     decosToRemove
      //   );
      //   debugger;

      //   return decorationsSet
      //     .map(tr.mapping, tr.doc)
      //     .remove(decosToRemove)
      //     .add(tr.doc, decosToAdd);
      // }

      return DecorationSet.create(tr.doc, getDecorations(tr.doc));

      // TODO: work on all nodes between last two headers
      // return decorationsSet.map(tr.mapping, tr.doc);

      // const { steps } = tr;
      // const firstStep = steps[0];

      // const addingChar =
      //   steps.length === 1 &&
      //   firstStep instanceof ReplaceStep &&
      //   firstStep.to - firstStep.from <= 2 &&
      //   (firstStep.slice.content.size === 2 ||
      //     firstStep.slice.content.size === 1);

      // const removingChar =
      //   steps.length === 1 &&
      //   firstStep instanceof ReplaceStep &&
      //   firstStep.from === firstStep.to - 1 &&
      //   firstStep.slice.content.size === 0;

      // //@ts-ignore
      // if (firstStep.slice.content.content[0]) {
      //   console.log(
      //     //@ts-ignore
      //     firstStep.slice.content.content[0].text,
      //     //@ts-ignore
      //     firstStep.slice.content.size
      //   );
      // }

      // if (!addingChar && !removingChar) {
      //   console.log("fuuul stuff");
      //   return DecorationSet.create(tr.doc, getDecorations(tr.doc));
      // }

      // // @ts-ignore
      // const text = firstStep.slice.content.content[0].text;
      // if (text.indexOf("`") !== -1) {
      //   return DecorationSet.create(tr.doc, getDecorations(tr.doc));
      // }

      // const pos = tr.doc.resolve(firstStep.from);
      // const node = pos.parent;
      // const decosToRemove = decorationsSet.find(
      //   firstStep.from - pos.parentOffset,
      //   firstStep.from - pos.parentOffset + node.nodeSize
      // );
      // const decosToAdd = getDecorations(
      //   node,
      //   firstStep.from - pos.parentOffset
      // );

      // debugger;
      // return decorationsSet
      //   .map(tr.mapping, tr.doc)
      //   .remove(decosToRemove)
      //   .add(tr.doc, decosToAdd);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});
