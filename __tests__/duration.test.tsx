import duration, { buttonClassName } from "../src/editor/decorations/duration";

import { exist, render } from "./lib";

describe("duration", () => {
  it("render and interactions", async () => {
    await render(`30m`);
    await exist(duration, 1);

    const getButton = () => document.querySelector(`.${buttonClassName}`);
    expect(getButton()).not.toBeNull();
  });
});
