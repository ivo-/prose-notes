import { keymap } from "prosemirror-keymap";
import { Command } from "prosemirror-state";
import { undo, redo } from "prosemirror-history";
import {
  selectParentNode,
  baseKeymap,
  chainCommands,
} from "prosemirror-commands";

import { ProseDecorations } from "./decorations";
import {
  splitBlockWithDecorations,
  killLine,
  cloneLine,
  indentList,
  unindentList,
} from "./commands";

const isMac =
  typeof window !== "undefined"
    ? navigator.platform.toUpperCase().indexOf("MAC") >= 0
    : false;

const baseCommands: { [keyBinding: string]: Command } = {
  "Mod-z": undo,
  "Shift-Mod-z": redo,

  "Mod-l": selectParentNode,
  "Mod-Shift-x": killLine,
  "Mod-Shift-l": cloneLine,

  "Shift-Enter": baseKeymap["Enter"],
  "Ctrl-Enter": baseKeymap["Enter"],

  Tab: indentList,
  "Shift-Tab": unindentList,

  Enter: splitBlockWithDecorations,

  ...(isMac
    ? {
        // "Mod-Shift-Enter": durationContinue,
      }
    : {
        // "Ctrl-ArrowDown": selectNextHeader,
      }),
};

const allCommandsList = [
  ...ProseDecorations.map((d) => d.keyBindings || {}),
  baseCommands,
].reduce(
  (res, cmdMap) => {
    if (cmdMap) {
      for (const [key, command] of Object.entries(cmdMap)) {
        if (!res[key]) res[key] = [];
        res[key].push(command);
      }
    }
    return res;
  },
  {} as { [key: string]: Command[] }
);

let proseCommands: { [key: string]: Command } = {};
Object.entries(allCommandsList).map(([key, commands]) => {
  proseCommands[key] = chainCommands(...commands);
});

export default keymap(proseCommands);
