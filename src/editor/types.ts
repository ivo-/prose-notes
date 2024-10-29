import { Node } from "prosemirror-model";
import { Transaction, Command } from "prosemirror-state";
import { EditorView, Decoration } from "prosemirror-view";

export type WidgetCreator = (
  m: RegExpExecArray,
  pos: number,
  node: Node,
  executionContext: { [key: string]: unknown }
) => Decoration[];

export const DECORATION_TYPE_INLINE = "inline" as const;
export const DECORATION_TYPE_NODE = "node" as const;
export const DECORATION_TYPE_MULTI_NODE = "multi-node" as const;

export type ProseDecoration = {
  name: string;

  type:
    | typeof DECORATION_TYPE_INLINE // They work on the text node.
    | typeof DECORATION_TYPE_NODE // They work on the wrapper node, not on the text node.
    | typeof DECORATION_TYPE_MULTI_NODE; // Decorations that require the same open and close strings and capture all the lines in between. */

  regex: RegExp;

  // Class name to be applied to the decoration, widgets override this.
  className: string;

  // We don't want some of the decorations inside a table.
  excludedInTable?: boolean;

  // On Enter the new line will start with the same decoration.
  repeat?: (
    lineText: string,
    match: RegExpMatchArray,
    pos: number,
    tr: Transaction
  ) => void;

  // Create widget instead of the standard inline decoration. For multi-node
  // decorations widget will be created either ways.
  widget?: WidgetCreator;

  onClickHandlers?: {
    [className: string]: (
      e: React.MouseEvent<HTMLElement>,
      elm: HTMLElement,
      view: EditorView
    ) => void;
  };

  // Key bindings defined by the decoration.
  keyBindings?: {
    [keyBinding: string]: Command;
  };

  // Commands are auto-completed and can be used in the editor.
  commands?: {
    [name: string]: (tr: Transaction) => Transaction;
  };

  menuOptions?: {
    name: string;
    handler: (elm: HTMLElement) => void;
  }[];

  // Char surrounding the decoration if there is any. Like `*` for bold`.
  char?: string;
};

export type Context = { [key: string]: unknown };
