import { fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import todo, {
  checkedClassName,
  className,
} from "../src/editor/decorations/todo";
import { exist, render } from "./lib";

describe("todo", () => {
  it("render and repeat", async () => {
    await render(`- todo 1`, {
      anchor: 9,
      head: 9,
      type: "text",
    });
    await exist(todo, 1);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(todo, 2);

    fireEvent.keyDown(document.activeElement as HTMLElement, {
      key: "Enter",
    });
    await exist(todo, 1);

    const getChecked = () => document.querySelector(`.${checkedClassName}`);
    expect(getChecked()).toBeNull();

    fireEvent.click(document.querySelector(`.${className}`) as HTMLElement);
    expect(getChecked()).not.toBeNull();
  });

  it("check/uncheck mouse", async () => {
    await render(`- todo 1`, {
      anchor: 9,
      head: 9,
      type: "text",
    });
    await exist(todo, 1);

    const getChecked = () => document.querySelector(`.${checkedClassName}`);
    expect(getChecked()).toBeNull();

    fireEvent.click(document.querySelector(`.${className}`) as HTMLElement);
    expect(getChecked()).not.toBeNull();

    fireEvent.click(document.querySelector(`.${className}`) as HTMLElement);
    expect(getChecked()).toBeNull();
  });

  it("check/uncheck keyboard", async () => {
    await render(`- todo 1`, {
      anchor: 9,
      head: 9,
      type: "text",
    });
    await exist(todo, 1);

    const getChecked = () => document.querySelector(`.${checkedClassName}`);
    expect(getChecked()).toBeNull();

    await userEvent.tab();
    expect(getChecked()).not.toBeNull();

    await userEvent.tab();
    expect(getChecked()).toBeNull();
  });

  it("keyboard reset", async () => {
    await render(
      `- todo 1
+ todo 2
+ todo 3
- todo 4`,
      {
        anchor: 9,
        head: 9,
        type: "text",
      }
    );
    await exist(todo, 4);

    const getCheckedLength = () =>
      document.querySelectorAll(`.${checkedClassName}`).length;
    expect(getCheckedLength()).toEqual(2);

    await userEvent.keyboard("{control>}i");
    expect(getCheckedLength()).toEqual(0);
  });
});
