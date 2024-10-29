import { fireEvent } from "@testing-library/react";
import proportion, {
  className,
  leftClassName,
  rightClassName,
} from "../src/editor/decorations/proportion";
import { exist, render } from "./lib";

describe("proportion", () => {
  it("render and interactions", async () => {
    await render(`[1/3]`);

    await exist(proportion, 1);

    const getLeft = () =>
      document.querySelector(`.${leftClassName}`) as HTMLElement;
    const getRight = () =>
      document.querySelector(`.${rightClassName}`) as HTMLElement;
    const getContent = () =>
      document.querySelector(`.${className}`)?.textContent;

    expect(getContent()).toBe("1/3");

    fireEvent.click(getLeft());
    expect(getContent()).toBe("0/3");

    fireEvent.click(getLeft());
    expect(getContent()).toBe("0/3");

    fireEvent.click(getRight());
    expect(getContent()).toBe("1/3");

    fireEvent.click(getRight());
    fireEvent.click(getRight());
    fireEvent.click(getRight());
    expect(getContent()).toBe("3/3");
  });
});
