import { render, exist } from "./lib";
import varDeco, {
  className,
  labelClassName,
} from "../src/editor/decorations/var";
import { waitFor } from "@testing-library/react";

describe("variable", () => {
  it("rendering and updating", async () => {
    const getVars = () =>
      Array.from(document.querySelectorAll(`.${className}`)) as HTMLElement[];

    const getVarLabels = () =>
      Array.from(
        document.querySelectorAll(`.${labelClassName}`)
      ) as HTMLButtonElement[];

    await render(` ${"{{a = 10}}"} ${"{{a + 10}}"} `);
    await exist(varDeco, 2);

    let [label1, label2] = getVarLabels();
    expect(label1.textContent).toBe("10");
    expect(label2.textContent).toBe("20");

    const [var1] = getVars();
    var1.innerHTML = "{{a = 20}}";

    await waitFor(() => {
      [label1, label2] = getVarLabels();
      expect(label1.textContent).toBe("20");
      expect(label2.textContent).toBe("30");
    });
  });
});
