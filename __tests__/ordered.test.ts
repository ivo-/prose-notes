import { fireEvent } from "@testing-library/react";
import ordered from "../src/editor/decorations/ordered";
import { exist, render } from "./lib";

describe("ordered", () => {
  it("render and interactions", async () => {
    await render(
      `1. A
2. B`,
      {
        anchor: 11,
        head: 11,
        type: "text",
      }
    );
    await exist(ordered, 2);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });

    await exist(ordered, 3);

    expect(
      document.querySelectorAll(`.${ordered.className}`)[2].textContent
    ).toBe("3.");

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });

    await exist(ordered, 2);
  });
});
