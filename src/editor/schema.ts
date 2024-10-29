import { Schema, Node } from "prosemirror-model";

const p: [string, ...any] = ["p", 0];
const br: [string, ...any] = ["br"];

export default new Schema({
  nodes: {
    doc: {
      content: "block+",
    },

    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return p;
      },
    },

    text: {
      group: "inline",
      toDOM(node: Node) {
        return String(node.text);
      },
    },

    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{ tag: "br" }],
      toDOM: () => br,
    },
  },
});
