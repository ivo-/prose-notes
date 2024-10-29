import debounce from "debounce";
import React, { useReducer, useEffect, useCallback } from "react";
import { EditorView } from "prosemirror-view";
import { useBeforeUnload, useEvent } from "react-use";
import toast, { Toaster } from "react-hot-toast";
import useKeyboardJs from "react-use/lib/useKeyboardJs";
import { init, persist, createOrSelectNoteContent } from "../editor/io";

import { EditorMode, type Mode } from "./EditorMode";
import Menu from "./Menu";
import Presentation from "./Presentation";
import Preview from "./Preview";
import Editor from "./Editor";
import EditorLoading from "./EditorLoading";
import { parseEditorContent } from "../editor/utils";
import {
  State,
  reducer,
  initialState as defaultInitialState,
  setGlobalState,
} from "../editor/state";

const showError = (msg: string) => {
  toast.error(msg);
};

const showSuccess = (msg: string) => {
  toast.success(msg);
};

const EditorState: React.FC<{ initialState?: State }> = ({ initialState }) => {
  // Toggle between editor, preview and presentation mode.
  const [mode, setMode] = React.useState<Mode>("editor");

  const [isPressed] = useKeyboardJs("ctrl+space");
  useEffect(() => {
    if (isPressed) {
      setMode((prev) => (prev === "editor" ? "preview" : prev));
    } else {
      setMode((prev) => (prev === "preview" ? "editor" : prev));
    }
  }, [isPressed]);

  // Keep the application state.
  const [state, dispatch] = useReducer(
    reducer,
    initialState || defaultInitialState
  );

  // XXX: This is a hack to make the state available to the plugins.
  setGlobalState(state);

  // XXX: updateCurrentNote should never be updated because the Editor will use
  //      an older version, since it is never updated unless we change the
  //      current note.
  // TODO: don't debounce?
  // @ts-ignore
  const isTesting = process.env.NODE_ENV === "test";
  const updateCallback = async (_: any, view: EditorView) => {
    const content = view.state.toJSON();

    const { tags, title } = parseEditorContent(content);

    dispatch({
      type: "UPDATE_CURRENT_NOTE",
      data: { title, content, tags },
    });

    showSuccess("Note updated");
  };
  updateCallback.flush = async () => {};
  updateCallback.isPending = false;

  const updateCurrentNote = useCallback(
    isTesting ? updateCallback : debounce(updateCallback, 1000),
    []
  );

  const createEmptyNote = useCallback(async () => {
    await updateCurrentNote.flush();

    dispatch({ type: "ADD_EMPTY_NOTE" });

    showSuccess("Note created");
  }, [updateCurrentNote]);

  const setCurrentNote = useCallback(
    async (id: string) => {
      await updateCurrentNote.flush();
      if (mode !== "editor") {
        setMode("editor");
      }

      if (state.currentNote && state.currentNote.id === id) {
        return;
      }

      const note = state.notes.find((note) => note.id === id);
      if (!note) {
        showError(`Cannot find note with id: ${id}`);
        return;
      }

      const content = await createOrSelectNoteContent(note.id);

      dispatch({
        type: "SET_CURRENT_NOTE",
        note: {
          ...note,
          content,
        },
      });
    },
    [state, mode, updateCurrentNote]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await updateCurrentNote.flush();

      dispatch({ type: "DELETE_NOTE", id });

      showSuccess("Note deleted");
    },
    [updateCurrentNote]
  );

  useEffect(() => {
    if (!state.isLoading) return;

    init(state).then((s) => {
      console.log(
        "==> init",
        s.currentNote?.content,
        state.currentNote?.content
      );
      dispatch({
        type: "SET_VALUES",
        values: {
          ...s,
          isLoading: false,
        },
      });

      if (s.notes.length === 0) {
        createEmptyNote();
      } else if (!s.currentNote) {
        setCurrentNote(s.notes[0].id);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.isLoading) return;
    persist(state);
  }, [state]);

  // TODO: remove unless debugging.
  // @ts-ignore
  window.State = state;

  useBeforeUnload(
    useCallback(() => updateCurrentNote.isPending, [updateCurrentNote]),
    "You have unsaved changes, are you sure?"
  );

  useEvent(
    "blur",
    useCallback(() => updateCurrentNote.flush(), [updateCurrentNote])
  );

  if (state.isLoading) {
    return <EditorLoading />;
  }

  // TODO: Extract mode component.
  return (
    <div className="columns is-full-width">
      <div className="column is-flex-grow-0">
        <EditorMode mode={mode} setMode={setMode} />
        <Menu
          notes={state.notes}
          currentNoteId={state.currentNote?.id || null}
          onDelete={deleteNote}
          onCreateEmptyNote={createEmptyNote}
          onSetCurrentNote={setCurrentNote}
        />
      </div>

      {state.currentNote ? (
        <div className="column">
          <div style={mode === "editor" ? {} : { display: "none" }}>
            {/* XXX: Editor component will be updated only if the key is changed. */}
            <Editor
              key={state.currentNote.id}
              noteId={state.currentNote.id}
              initialContent={state.currentNote.content}
              onUpdate={updateCurrentNote}
            />
          </div>

          {mode === "preview" && <Preview key={state.currentNote.id} />}
          {mode === "presentation" && (
            <Presentation key={state.currentNote.id} />
          )}
          <Toaster />
        </div>
      ) : null}
    </div>
  );
};

export default EditorState;
