import { fireEvent } from "@testing-library/react";
import checkbox, {
  checkedClassName,
  className,
} from "../src/editor/decorations/checkbox";
import { exist, render } from "./lib";

describe("checkbox", () => {
  it("render and interactions", async () => {
    await render(`[-]`);
    await exist(checkbox, 1);

    const getElm = () => document.querySelector(`.${className}`) as HTMLElement;
    const getChecked = () => document.querySelector(`.${checkedClassName}`);

    expect(getChecked()).toBeNull();

    fireEvent.click(getElm());
    expect(getChecked()).not.toBeNull();

    fireEvent.click(getElm());
    expect(getChecked()).toBeNull();
  });
});
