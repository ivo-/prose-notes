import { keymap } from "prosemirror-keymap";
import { gapCursor } from "prosemirror-gapcursor";
import { dropCursor } from "prosemirror-dropcursor";
import { history } from "prosemirror-history";
import { baseKeymap } from "prosemirror-commands";

import proseKeymap from "./keymap";
import inputRules from "./input-rules";
import decorations from "./decorations";
import autocomplete from "./autocomplete";

export default [
  inputRules,

  history(),
  dropCursor(),
  gapCursor(),

  ...autocomplete,

  proseKeymap,
  keymap(baseKeymap),

  decorations,
];
