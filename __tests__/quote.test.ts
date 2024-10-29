import { fireEvent } from "@testing-library/react";
import quote from "../src/editor/decorations/quote";
import { exist, render } from "./lib";

describe("quote", () => {
  it("render and interactions", async () => {
    await render(`> quote 1`, {
      anchor: 11,
      head: 11,
      type: "text",
    });
    await exist(quote, 1);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(quote, 2);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(quote, 1);
  });
});
