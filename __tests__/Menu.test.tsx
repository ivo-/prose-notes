import { fireEvent } from "@testing-library/react";
import heading from "../src/editor/decorations/heading";
import tag from "../src/editor/decorations/tag";
import { exist, render, tagExists } from "./lib";

describe("Menu", () => {
  it("rendering note title and tags", async () => {
    await render(
      `# Note title
    #tag1
    #tag2/subtag1
`
    );
    await exist(heading, 1);
    await exist(tag, 2);

    fireEvent.click(document.querySelector(`.${heading.className}--widget`)!);

    await tagExists("tag1", [], 1);
    await tagExists("tag2/subtag1", [], 1);
    await tagExists("tag2", ["tag2/subtag1"], 1);
  });
});
