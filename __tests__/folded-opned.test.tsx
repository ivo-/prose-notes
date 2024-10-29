import { fireEvent } from "@testing-library/react";
import folded, {
  classNameClosing,
  classNameOpening,
} from "../src/editor/decorations/folded";
import opened, {
  classNameClosing as cnClosing,
  classNameOpening as cnOpening,
} from "../src/editor/decorations/opened";
import { exist, render } from "./lib";

describe("folded-opened", () => {
  it("render and interactions", async () => {
    const getClosedOpening = () =>
      document.querySelector(`.${classNameOpening}`);
    const getClosedClosing = () =>
      document.querySelector(`.${classNameClosing}`);

    await render(
      `...
    folded text
...
`,
      {
        anchor: 9,
        head: 9,
        type: "text",
      }
    );

    await exist(folded, 3);
    expect(getClosedOpening()).not.toBeNull();
    expect(getClosedClosing()).not.toBeNull();

    fireEvent.click(getClosedOpening()!);

    await exist(folded, 0);
    await exist(opened, 3);

    const getOpenedOpening = () => document.querySelector(`.${cnOpening}`);
    const getOpenedClosing = () => document.querySelector(`.${cnClosing}`);

    expect(getOpenedOpening()).not.toBeNull();
    expect(getOpenedClosing()).not.toBeNull();

    fireEvent.click(getOpenedOpening()!);

    await exist(folded, 3);
    await exist(opened, 0);
  });
});
