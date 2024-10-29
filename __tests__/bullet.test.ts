import { fireEvent } from "@testing-library/react";
import bullet from "../src/editor/decorations/bullet";
import { exist, render } from "./lib";

describe("bullet", () => {
  it("render and interactions", async () => {
    await render(`* bullet 1`, {
      anchor: 11,
      head: 11,
      type: "text",
    });
    await exist(bullet, 1);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(bullet, 2);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(bullet, 1);
  });
});
