import { fireEvent } from "@testing-library/react";
import counter, {
  className,
  leftClassName,
  rightClassName,
} from "../src/editor/decorations/counter";
import { exist, render } from "./lib";

describe("counter", () => {
  it("render and interactions", async () => {
    await render(`[1]`);

    await exist(counter, 1);

    const getLeft = () =>
      document.querySelector(`.${leftClassName}`) as HTMLElement;
    const getRight = () =>
      document.querySelector(`.${rightClassName}`) as HTMLElement;
    const getContent = () =>
      document.querySelector(`.${className}`)?.textContent;

    expect(getContent()).toBe("1");

    fireEvent.click(getLeft());
    expect(getContent()).toBe("0");

    fireEvent.click(getLeft());
    expect(getContent()).toBe("0");

    fireEvent.click(getRight());
    expect(getContent()).toBe("1");

    fireEvent.click(getRight());
    fireEvent.click(getRight());
    expect(getContent()).toBe("3");
  });
});
