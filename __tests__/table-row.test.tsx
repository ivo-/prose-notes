import { fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import tableRow from "../src/editor/decorations/table-row";
import { exist, getTrimmedContent, render } from "./lib";

describe("table row", () => {
  it("repeating", async () => {
    await render(`| col 1 | col 2`, {
      anchor: 16,
      head: 16,
      type: "text",
    });
    await exist(tableRow, 1);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(tableRow, 2);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(tableRow, 1);
  });

  it("new cell formatting", async () => {
    await render(`| col 1 | col 2`, {
      anchor: 16,
      head: 16,
      type: "text",
    });
    await exist(tableRow, 1);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(tableRow, 2);

    expect(getTrimmedContent()).toBe(`| col 1 | col 2
|`);

    await userEvent.keyboard("c");
    await userEvent.tab();
    expect(getTrimmedContent()).toBe(`|  col 1  |  col 2 |
|    c    |        |`);

    await userEvent.keyboard("c");
    await userEvent.tab();
    expect(getTrimmedContent()).toBe(`|  col 1  |  col 2  |
|    c    |   c     |`);
  });

  it("separator formatting", async () => {
    await render(
      `| col 1 | col 2
|-`,
      {
        anchor: 18,
        head: 18,
        type: "text",
      }
    );
    await exist(tableRow, 2);

    await userEvent.tab();
    expect(getTrimmedContent()).toBe(`|  col 1  |  col 2 |
|---------|--------|`);
  });
});
