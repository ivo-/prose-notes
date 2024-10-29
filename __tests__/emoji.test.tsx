import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { className, listClassName } from "../src/editor/autocomplete";
import { getTrimmedContent, render } from "./lib";

describe("emoji", () => {
  it("insert and render", async () => {
    await render(``);

    await waitFor(() =>
      userEvent.type(document.querySelector(".ProseMirror") as HTMLElement, ":")
    );

    expect(document.querySelector(`.${className}`)).not.toBeNull();
    expect(document.querySelector(`.${listClassName}`)).not.toBeNull();

    await waitFor(() => screen.getByText("Note updated"));
    await screen.findByText("Smiling face");

    expect(getTrimmedContent()).toBe(`:`);
    await userEvent.click(screen.getByText("Smiling face"));

    expect(screen.queryByText("Smiling face")).not.toBeInTheDocument();
    expect(screen.getAllByText("☺")).toHaveLength(2); // in note and title
  });
});
