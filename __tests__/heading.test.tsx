import { fireEvent } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import heading from "../src/editor/decorations/heading";
import headingFolded from "../src/editor/decorations/heading-folded";
import { exist, existHeading, render } from "./lib";

describe("heading", () => {
  it("render and interactions", async () => {
    await render(`
# Heading 1
some content

## Hello, world!
some other content
`);
    await exist(heading, 2);
    await existHeading(1, 1);
    await existHeading(2, 1);

    const [h1] = Array.from(
      document.querySelectorAll(`.${heading.className}--widget`)
    ) as HTMLElement[];

    fireEvent.click(h1);

    await exist(heading, 2);
    await existHeading(1, 0);
    await existHeading(2, 2);

    const [_, h2] = Array.from(
      document.querySelectorAll(`.${heading.className}--widget`)
    ) as HTMLElement[];

    fireEvent.click(h2);

    await exist(heading, 2);
    await existHeading(1, 0);
    await existHeading(2, 1);
    await existHeading(3, 1);
  });

  it("toggle", async () => {
    await render(
      `
# Heading 1
some content

## Hello, world!
`,
      {
        anchor: 5,
        head: 5,
        type: "text",
      }
    );
    await existHeading(1, 1);

    await userEvent.tab();
    await exist(headingFolded, 4);

    await userEvent.tab();
    await exist(headingFolded, 0);
  });
});
