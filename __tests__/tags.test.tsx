import { v4 as uuidv4 } from "uuid";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { className, listClassName } from "../src/editor/autocomplete";
import { getTrimmedContent, render } from "./lib";

describe("tags", () => {
  it("autocomplete note tags", async () => {
    await render(` #tag1 #animals #tag1/sub1 #tag1/sub2 #tag1/sub1/re2 `);

    await waitFor(() =>
      userEvent.type(
        document.querySelector(".ProseMirror") as HTMLElement,
        "#t"
      )
    );

    await waitFor(() => {
      expect(document.querySelector(`.${className}`)).not.toBeNull();
      expect(document.querySelector(`.${listClassName}`)).not.toBeNull();
    });

    await screen.findByText("tag1");
    await screen.findByText("tag1/sub1");
    await screen.findByText("tag1/sub2");
    await screen.findByText("tag1/sub1/re2");

    await userEvent.click(screen.getByText("tag1/sub2"));

    expect(screen.queryByText("tag1/sub2")).not.toBeInTheDocument();

    expect(getTrimmedContent()).toBe(
      `#tag1 #animals #tag1/sub1 #tag1/sub2 #tag1/sub1/re2 #tag1/sub2`
    );
  });

  it("autocomplete other notes tags", async () => {
    await render(
      ``,
      {
        type: "text",
        anchor: 0,
        head: 0,
      },
      {
        id: uuidv4(),
        title: "",
        tags: ["foods", "drinks"],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    );

    await waitFor(() =>
      userEvent.type(
        document.querySelector(".ProseMirror") as HTMLElement,
        "#f"
      )
    );

    await waitFor(() => {
      expect(document.querySelector(`.${className}`)).not.toBeNull();
      expect(document.querySelector(`.${listClassName}`)).not.toBeNull();
    });

    await screen.findByText("foods");
    await userEvent.click(screen.getByText("foods"));

    expect(screen.queryByText("foods")).not.toBeInTheDocument();
    expect(getTrimmedContent()).toBe(`#foods`);
  });
});
