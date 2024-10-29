import { v4 as uuidv4 } from "uuid";

export type Note = {
  id: string;
  title: string;
  tags: string[];
  content: {
    doc: unknown;
    selection: unknown;
  };
  createdAt: number;
  updatedAt: number;
};

export type State = {
  notes: Omit<Note, "content">[];
  currentNote: Note | null;
  isLoading: boolean;
  updatedAt: number;
};

const firstNote = {
  id: uuidv4(),
  title: "",
  tags: [],
  content: {} as any,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
export const initialState: State = {
  notes: [firstNote],
  currentNote: firstNote,
  isLoading: true,
  updatedAt: 0,
};

export type Action =
  | { type: "SET_VALUES"; values: Partial<State> }
  | { type: "ADD_EMPTY_NOTE" }
  | { type: "SET_CURRENT_NOTE"; note: Note }
  | { type: "UPDATE_CURRENT_NOTE"; data: Partial<Note> }
  | { type: "DELETE_NOTE"; id: Note["id"] };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_VALUES":
      return {
        ...state,
        ...action.values,
        updatedAt: Date.now(),
      };

    case "SET_CURRENT_NOTE":
      return {
        ...state,
        currentNote: action.note,
        isLoading: false,
        updatedAt: Date.now(),
      };

    case "UPDATE_CURRENT_NOTE":
      return state.currentNote
        ? {
            ...state,
            notes: state.notes.map((note) =>
              note.id === state.currentNote?.id
                ? { ...note, ...action.data, content: null }
                : note
            ),
            currentNote: {
              ...state.currentNote,
              ...action.data,
              updatedAt: Date.now(),
            },
            isLoading: false,
            updatedAt: Date.now(),
          }
        : state;

    case "ADD_EMPTY_NOTE": {
      const note = {
        id: uuidv4(),
        title: "",
        tags: [],
        content: {} as any,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      return {
        ...state,
        notes: [...state.notes, note],
        currentNote: note,
        isLoading: false,
        updatedAt: Date.now(),
      };
    }

    case "DELETE_NOTE":
      const notes = state.notes.filter((note) => note.id !== action.id);
      if (notes.length === 0) return state;

      return {
        ...state,
        notes,
        currentNote:
          state.currentNote?.id === action.id ? null : state.currentNote,
        isLoading: false,
        updatedAt: Date.now(),
      };

    default:
      // @ts-ignore This should never happen
      throw new Error(`Unknown action: ${action.type}`);
  }
}

let globalState: State = initialState;
export const setGlobalState = (s: State) => {
  globalState = s;
};
export const getGlobalState = () => globalState;
