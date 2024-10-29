import {
  screen,
  render as tlRender,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import EditorState from "../src/components/EditorState";
import { noteClassName, tagClassName } from "../src/components/Menu";
import heading from "../src/editor/decorations/heading";
import { State, getGlobalState, initialState } from "../src/editor/state";
import { ProseDecoration } from "../src/editor/types";
import { parseEditorContent } from "../src/editor/utils";

jest.mock("../src/editor/io", () => ({
  init: jest.fn((state) => Promise.resolve(state)),
  listenForFileUploads: jest.fn(() => () => {}),
  persist: jest.fn(),
}));

export const render = async (
  content: string,
  selection?: unknown,
  extraNote?: State["notes"][number]
) => {
  return tlRender(
    <EditorState
      initialState={{
        ...initialState,
        notes: [...initialState.notes, ...(extraNote ? [extraNote] : [])],
        currentNote: {
          ...(initialState.currentNote as any),
          content: {
            doc: {
              type: "doc",
              content: content.split("\n").map((line) => ({
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: line || " ",
                  },
                ],
              })),
            },
            selection: selection
              ? selection
              : {
                  type: "text",
                  anchor: 0,
                  head: 0,
                },
          },
        },
      }}
    />
  );
};

export const view = (value: "Editor" | "Presentation" | "Preview") =>
  waitFor(() => {
    const radio = screen.getByRole("radio", { name: value });
    radio.click();
    expect(radio).toBeChecked();
  });

export const exist = async (deco: ProseDecoration, count: number) =>
  waitFor(() => {
    expect(document.querySelectorAll(`.${deco.className}`)).toHaveLength(count);
  });

export const existHeading = async (level: number, count: number) =>
  waitFor(() => {
    expect(
      document.querySelectorAll(`.${heading.className}--${level}`)
    ).toHaveLength(count);
  });

export const getTrimmedContent = () => {
  const content = getGlobalState()?.currentNote?.content as any;
  if (!content) {
    return "";
  }
  return parseEditorContent(content).fullText.trim();
};

export const tagExists = async (
  tag: string,
  subtags: string[],
  notesLength: number
) => {
  await waitFor(() => {
    const tagsFound = document.querySelectorAll(
      `.${tagClassName}[data-tag="${tag}"]`
    );
    expect(tagsFound).toHaveLength(1);

    const tagElm = tagsFound[0];
    subtags.forEach((t) => {
      expect(
        tagElm.querySelectorAll(`.${tagClassName}[data-tag="${t}"]`)
      ).toHaveLength(1);
    });
  });

  // TODO: Scoped query selector returns incorrect results.
  await waitFor(() => {
    const notes = document.querySelectorAll(
      `.${tagClassName}[data-tag="${tag}"] > details > ul > li.${noteClassName}  `
    );
    expect(notes).toHaveLength(notesLength);
  });
};
