import { createRoot } from "react-dom/client";
import React, { useEffect, useRef, memo, useCallback } from "react";
import { EditorView } from "prosemirror-view";
import { EditorState } from "prosemirror-state";
import schema from "../editor/schema";
import plugins from "../editor/plugins";
import { Note } from "../editor/state";
import { ProseDecorations } from "../editor/decorations";
import RowOptionsMenu from "./RowOptionsMenu";
import { listenForFileUploads } from "../editor/io";
import { toVisibleSpaces } from "../editor/utils";

const DecorationHandlers = ProseDecorations.map(
  (D) => D.onClickHandlers || {}
).reduce((result, handlers) => {
  for (const key in handlers) {
    if (key in result) {
      throw new Error(`Decoration handler collision on: ${key}`);
    }
  }
  return {
    ...result,
    ...handlers,
  };
}, {});

export type EditorProps = {
  noteId: string;
  initialContent: Note["content"];
  onUpdate: (noteId: string, content: EditorView) => void;
};
const Editor: React.FC<EditorProps> = ({
  noteId,
  initialContent,
  onUpdate,
}) => {
  const [editorView, setEditorView] = React.useState<EditorView | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const optionsElmRef = useRef<HTMLElement>(null);

  const handleRowMouseOver: React.MouseEventHandler<HTMLElement> = useCallback(
    (e) => {
      let target = e.target as HTMLElement;

      while (
        target.parentElement &&
        !target.parentElement?.classList.contains("ProseMirror")
      ) {
        target = target.parentElement;
      }

      if (!optionsRef.current) return;
      if (!target.parentElement) return;

      // @ts-ignore Current being read only.
      optionsElmRef.current = target;

      const rect = target.getBoundingClientRect();
      const { top, left } = rect;

      const elm = optionsRef.current;
      elm.style.top = `${top + window.scrollY}px`;
      elm.style.left = `${left - 30 + window.scrollX}px`;
    },
    []
  );

  const handleMouseLeave: React.MouseEventHandler<HTMLElement> =
    useCallback(() => {
      if (!optionsRef.current) return;

      optionsRef.current.style.top = `-1000px`;
      optionsRef.current.style.left = `-1000px`;

      // @ts-ignore Current being read only.
      optionsElmRef.current = null;
    }, []);

  const handleClick: React.MouseEventHandler<HTMLElement> = useCallback(
    (e) => {
      const target = e.target as HTMLElement;

      if (target === optionsRef.current) {
        if (!optionsElmRef.current) return;

        const { top, left } = optionsElmRef.current.getBoundingClientRect();
        const container = document.createElement("div");
        const root = createRoot(container);

        document.body.appendChild(container);
        document.body.style.overflow = "hidden";
        // TODO: Add element class name to container.
        const onClose = () => {
          document.body.removeChild(container);
          root.unmount();
          document.body.style.overflow = "";
        };

        root.render(
          <RowOptionsMenu
            top={top}
            left={left}
            triggerRow={optionsElmRef.current}
            onClose={onClose}
          />
        );
      }

      Object.keys(DecorationHandlers).forEach((className) => {
        if (target.classList.contains(className) && editorView) {
          DecorationHandlers[className](e, e.target as HTMLElement, editorView);
        }
      });
    },
    [editorView]
  );

  useEffect(() => {
    const unListen = listenForFileUploads((url) => {
      if (!editorView) return;
      editorView.dispatch(
        editorView.state.tr.insertText(` ![${url}] `).scrollIntoView()
      );
    });

    return () => unListen();
  }, [editorView]);

  useEffect(() => {
    if (!editorRef.current) return;
    console.log("==> create editor", initialContent);

    const view = new EditorView(editorRef.current, {
      state:
        initialContent && !!initialContent.doc
          ? EditorState.fromJSON({ schema, plugins }, initialContent)
          : EditorState.create({ schema, plugins }),
      dispatchTransaction: (tx) => {
        const newState = view.state.apply(tx);
        view.updateState(newState);

        if (!tx.docChanged) return;

        console.log("==> update note");
        onUpdate(noteId, view);
      },
      transformPastedHTML: (html) => {
        return html
          .split(/<[^>]*>/)
          .filter((s) => s.trim())
          .join()
          .split("\n")
          .map((s) => `<p>${toVisibleSpaces(s)}</p>`)
          .join("");
      },
    });
    setEditorView(view);
    view.focus();

    return () => {
      console.log("==> destroy editor");
      view.destroy();
    };
  }, [noteId, initialContent, onUpdate]);

  return (
    <div
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onMouseOver={handleRowMouseOver}
    >
      <div id="Editor" data-testid="editor" ref={editorRef} />
      <div id="options-menu" ref={optionsRef}>
        ::
      </div>
      <style jsx global>{`
        #Editor {
          padding: 0 10px 0 0px;
          position: relative;
          flex-grow: 1;
        }

        .ProseMirror {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          border: none;
          caret-color: #b5cc17;
        }

        .ProseMirror:focus {
          outline: 0;
        }

        #options-menu {
          z-index: 3;
          display: block;
          cursor: pointer;
          position: absolute;
          border: solid 1px #b5cc17;
          color: #b5cc17;
          padding: 0 5px;
          top: -1000px;
          left: -1000px;
        }
      `}</style>
    </div>
  );
};

export default memo(Editor, () => true);
