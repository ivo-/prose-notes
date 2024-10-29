import { Note, State } from "./state";

const STORAGE_KEY = "__prose_state__";

const getNoteContentKey = (id: string) => `__prose_note_content_${id}__`;

export const init = async (state: State): Promise<State> => {
  return window.localStorage.getItem(STORAGE_KEY)
    ? (() => {
        try {
          return JSON.parse(
            window.localStorage.getItem(STORAGE_KEY) as string
          ) as State;
        } catch (e) {
          return state;
        }
      })()
    : state;
};

export const persist = async (state: State) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  const currentNote = state.currentNote;
  if (!currentNote) return;

  localStorage.setItem(
    getNoteContentKey(currentNote.id),
    JSON.stringify(currentNote.content)
  );
};

export const createOrSelectNoteContent = async (id: string) => {
  const content = window.localStorage.getItem(getNoteContentKey(id))
    ? (() => {
        try {
          return JSON.parse(
            window.localStorage.getItem(getNoteContentKey(id)) as string
          ) as Note["content"];
        } catch (e) {
          return {};
        }
      })()
    : {};

  return content as Note["content"];
};

export const uploadFile = async (sourceFilePath: string) => {
  return sourceFilePath;
};

export const listenForFileUploads = (_: (_: string) => void) => {
  return () => {};
};

export const openDataDir = async () => {
  return "";
};
