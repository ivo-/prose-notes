import { Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { ProseDecorations } from "../editor/decorations";
import emojis from "./emojis";
import { getGlobalState } from "./state";

import autocomplete, {
  ActionKind,
  AutocompleteAction,
  closeAutocomplete,
  FromTo,
  Options,
} from "prosemirror-autocomplete";

const COMMANDS = ProseDecorations.map((D) => D.commands || {}).reduce(
  (result, cmds) => {
    for (const key in cmds) {
      if (key in result) {
        throw new Error(`Decoration command collision on: ${key}`);
      }
    }
    return {
      ...result,
      ...cmds,
    };
  },
  {}
);

const commandNames = Object.keys(COMMANDS);
const emojiDescriptions = Object.keys(emojis);

type CompletionType = {
  getReplacement: (s: string) => string;
  getSuggestions: (filter: string, trigger: string) => string[];
  shouldClose?: (filter: string) => boolean;
  onReplacementTransaction?: (s: string, tr: Transaction) => Transaction;
};
const CompleteTypes: {
  [key: string]: CompletionType;
} = {
  hashtag: {
    getReplacement: (s) => `#${s}`,
    getSuggestions: (filter, trigger) => {
      const { notes } = getGlobalState();
      const suggestions = Array.from(new Set(notes.map((n) => n.tags).flat()));
      const f = `${trigger.replace("#", "")}${filter}`;
      if (suggestions.indexOf(f) === -1) {
        suggestions.push(f);
      }
      return suggestions.filter((s) => s.indexOf(f) !== -1);
    },
    shouldClose: (filter) => {
      return filter.indexOf("#") !== -1;
    },
  },

  emoji: {
    getReplacement: (s) => emojis[s as keyof typeof emojis],
    getSuggestions: (filter) => {
      const suggestions = emojiDescriptions.slice();
      if (!filter) return suggestions;
      if (suggestions.indexOf(filter) === -1) {
        suggestions.push(filter);
      }
      return suggestions.filter((s) => s.indexOf(filter) !== -1);
    },
  },

  command: {
    getReplacement: () => "",
    onReplacementTransaction: (s, tr) => {
      return COMMANDS[s as keyof typeof COMMANDS](tr);
    },
    getSuggestions: (filter) => {
      const suggestions = commandNames.slice();
      if (!filter) return suggestions;
      return suggestions.filter((s) => s.indexOf(filter) !== -1);
    },
  },
};

export const className = "autocomplete";
export const containerClassName = `${className}--container`;
export const listClassName = `${className}--list`;
export const selectedClassName = `${className}--selected`;

export type AutocompleteState = {
  listElm: HTMLDivElement;
  lastProps: AutocompleteProps;
};

export type AutocompleteProps = {
  view: EditorView;
  cType: CompletionType;
  open: boolean;
  current: number;
  range: FromTo;
  suggestions: string[];
};

export const renderList = (
  state: AutocompleteState,
  props: AutocompleteProps
) => {
  let styles: React.CSSProperties = {
    display: props.open ? "block" : "none",
  };

  if (!props.open) {
    Object.assign(state.listElm.style, styles);
    state.listElm.innerHTML = "";
    return;
  }

  const rect = document
    .getElementsByClassName(className)[0]
    ?.getBoundingClientRect();

  // if (!rect || rect.top === 0) {
  //   Object.assign(state.listElm.style, styles);
  //   return;
  // }

  styles = {
    ...styles,
    top: rect ? `${rect.top + rect.height}px` : "0",
    left: rect ? `${rect.left}px` : "0",
  };

  const handleClick = (e: MouseEvent) => {
    const item = e.target as HTMLElement;
    if (!item.hasAttribute("data-index")) {
      return;
    }

    const text = item.textContent || "";
    let tr = props.view.state.tr
      .deleteRange(props.range.from, props.range.to)
      .insertText(props.cType.getReplacement(text));

    if (props.cType.onReplacementTransaction) {
      tr = props.cType.onReplacementTransaction(text, tr);
    }

    props.view.dispatch(tr);
    props.view.focus();

    closeAutocomplete(props.view);
  };

  Object.assign(state.listElm.style, styles);
  state.listElm.onclick = handleClick;

  const listItems = props.suggestions.slice(0, 10).map((suggestion, index) => {
    return `
      <div
        data-index="${index}"
        className="${index === props.current ? "selected" : ""}"
      >${suggestion}</div>
    `;
  });

  state.listElm.innerHTML = listItems.join("");
};

export function renderAutocomplete(
  state: AutocompleteState,
  props: AutocompleteProps
) {
  if (!state.listElm) {
    const container = document.createElement("div");
    container.className = containerClassName;
    document.body.appendChild(container);

    const list = document.createElement("div");
    list.className = listClassName;
    container.appendChild(list);

    state.listElm = list;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAutocomplete(props.view);
        return;
      }
    });

    document.addEventListener("click", (e) => {
      if (!container.contains(e.target as Node)) {
        closeAutocomplete(props.view);
      }
    });
  }

  state.lastProps = props;
  renderList(state, props);
}

export function reducer(
  state: AutocompleteState,
  action: AutocompleteAction
): boolean {
  // DEBUG:
  // console.log(
  //   `Action: ${action.kind}, Range: ${action.range.from}-${action.range.to}, Filter: ${action.filter}, Trigger: ${action.trigger}, Type: ${action.type?.name}`
  // );

  const autoCompleteType = action.type?.name;
  if (!autoCompleteType) return false;

  const cType = CompleteTypes[autoCompleteType];
  const suggestions = cType.getSuggestions(
    String(action.filter),
    action.trigger
  );

  switch (action.kind) {
    case ActionKind.open: {
      renderAutocomplete(state, {
        cType,
        open: true,
        current: 0,
        range: action.range,
        view: action.view,
        suggestions,
      });
      return true;
    }

    case ActionKind.filter: {
      const filter = action.filter || "";

      if (cType.shouldClose && cType.shouldClose(filter)) {
        closeAutocomplete(action.view);
        return false;
      }

      renderAutocomplete(state, {
        cType,
        open: true,
        current: 0,
        range: action.range,
        view: action.view,
        suggestions,
      });
      return true;
    }

    case ActionKind.close:
      renderAutocomplete(state, {
        cType,
        open: false,
        current: 0,
        range: action.range,
        view: action.view,
        suggestions: [],
      });
      return true;

    case ActionKind.enter: {
      const accepted = suggestions[state.lastProps.current];
      let tr = action.view.state.tr
        .deleteRange(action.range.from, action.range.to)
        .insertText(cType.getReplacement(accepted));

      if (cType.onReplacementTransaction) {
        tr = cType.onReplacementTransaction(accepted, tr);
      }
      action.view.dispatch(tr);
      return true;
    }

    case ActionKind.up:
      renderAutocomplete(state, {
        ...state.lastProps,
        current: Math.max(0, state.lastProps.current - 1),
      });
      return true;

    case ActionKind.down:
      renderAutocomplete(state, {
        ...state.lastProps,
        current: Math.min(
          state.lastProps.suggestions.length - 1,
          state.lastProps.current + 1
        ),
      });
      return true;
    default:
      return false;
  }
}

export const createOptions = () => {
  const state = {} as AutocompleteState;
  const options: Options = {
    triggers: [
      // For demo purposes, make the `#` and `@` easier to create
      {
        name: "hashtag",
        trigger: /(?:^|\s)(#[^#\s$])(?:$|\s)/,
        cancelOnFirstSpace: true,
      },
      // { name: "mention", trigger: /(@)$/ },
      { name: "emoji", trigger: ":" },
      // { name: "link", trigger: "[[", cancelOnFirstSpace: false },
      // { name: "jinja", trigger: "{{", cancelOnFirstSpace: false },
      {
        name: "command",
        trigger: /^(\/)$/,
      },
      // {
      //   name: "variable",
      //   trigger: /((?:^[a-zA-Z0-9_]+)\s?=)$/,
      //   cancelOnFirstSpace: false,
      // },
      // { name: "code", trigger: /((?:[a-zA-Z0-9_]+)\.)$/ },
    ],
    reducer: reducer.bind(null, state),
  };

  return options;
};

export default autocomplete(createOptions());
