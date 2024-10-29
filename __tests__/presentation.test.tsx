import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import bold from "../src/editor/decorations/bold";
import heading from "../src/editor/decorations/heading";
import {
  render,
  exist as exists,
  existHeading as existsHeading,
  view,
} from "./lib";
import italic from "../src/editor/decorations/italic";
import underline from "../src/editor/decorations/underline";
import strikethrough from "../src/editor/decorations/strikethrough";
import highlight from "../src/editor/decorations/highlight";
import link from "../src/editor/decorations/link";
import tag from "../src/editor/decorations/tag";
import quote from "../src/editor/decorations/quote";
import hr from "../src/editor/decorations/hr";
import ordered from "../src/editor/decorations/ordered";
import bullet from "../src/editor/decorations/bullet";
import * as todo from "../src/editor/decorations/todo";
import code, { highlightClassName } from "../src/editor/decorations/code";
import * as counter from "../src/editor/decorations/counter";
import * as proportion from "../src/editor/decorations/proportion";
import * as checkbox from "../src/editor/decorations/checkbox";
import date from "../src/editor/decorations/date";
import datetime from "../src/editor/decorations/datetime";
import duration from "../src/editor/decorations/duration";
import * as folded from "../src/editor/decorations/folded";
import tableRow from "../src/editor/decorations/table-row";
import * as opened from "../src/editor/decorations/opened";
import url from "../src/editor/decorations/url";
import _var from "../src/editor/decorations/var";
import img from "../src/editor/decorations/img";
import { ProseDecoration } from "../src/editor/types";
import { PRESENTATION_CONTAINER_ID } from "../src/editor/constants";
import { e } from "mathjs";

const slides = `
# Slide 1 - decorations

*bold* text
/italic/ text
_underlined_ text
~strikethrough~ text
\`highlighted\` text

http://google.com link
[google](http://google.com) like with title
    
#apple tag 

> Roses are red
>  Violets are blue,
> Sugar is sweet
>  And so are you.

---
# Slide 2 - Lists

1. Peach
2. Watermelon
3. Apple

* Apples
* Oranges
* Peaches

- Task 1
+ Task 2
- Task 3

---
# Slide 3 - Code

\`\`\`js
var a = 10;
var b = 30;
alert(a + b);
\`\`\`

---
# Slide 4 - Tables

*May 2024*
|---------|
|  *Mon*  |
|---------|
|   01    |
|---------|

---
# Slide 5 - Widgets

[4]
[1/5]
[-]

---
# Slide 6 - Variables


{{a = 10}}
{{a + 20%}}

---
# Slide 7 - Toggle

...
Answer
...
`;

describe("presentation", () => {
  it("render and interactions", async () => {
    await render(slides);
    await waitFor(() => {
      expect(screen.getByText("Add New")).toBeInTheDocument();
    });

    await exists(heading, 7);

    await view("Presentation");
    const presentation = document.querySelector(
      `#${PRESENTATION_CONTAINER_ID}`
    )! as HTMLElement;
    expect(presentation).not.toBeNull();

    const wrapper = within(presentation);

    // =============================================================================
    // Decorations

    expect(wrapper.getByTestId("current-page")).toHaveTextContent("1");
    expect(wrapper.getByTestId("pages")).toHaveTextContent("7");
    expect(wrapper.getByText("Slide 1 - decorations")).toBeInTheDocument();

    // =============================================================================
    // Lists

    fireEvent.click(wrapper.getByTestId("next"));
    expect(wrapper.getByTestId("current-page")).toHaveTextContent("2");
    expect(wrapper.getByText("Slide 2 - Lists")).toBeInTheDocument();

    expect(presentation.querySelectorAll(`.${todo.className}`)).toHaveLength(3);
    expect(
      presentation.querySelectorAll(`.${todo.checkedClassName}`)
    ).toHaveLength(1);

    fireEvent.click(presentation.querySelector(`.${todo.checkedClassName}`)!);
    await waitFor(() =>
      expect(
        presentation.querySelectorAll(`.${todo.checkedClassName}`)
      ).toHaveLength(0)
    );

    fireEvent.click(presentation.querySelectorAll(`.${todo.className}`)[0]!);
    await waitFor(() =>
      expect(
        presentation.querySelectorAll(`.${todo.checkedClassName}`)
      ).toHaveLength(1)
    );

    // =============================================================================
    // Code

    fireEvent.click(wrapper.getByTestId("next"));
    expect(wrapper.getByTestId("current-page")).toHaveTextContent("3");
    expect(wrapper.getByText("Slide 3 - Code")).toBeInTheDocument();

    // =============================================================================
    // Tables

    fireEvent.click(wrapper.getByTestId("next"));
    expect(wrapper.getByTestId("current-page")).toHaveTextContent("4");
    expect(wrapper.getByText("Slide 4 - Tables")).toBeInTheDocument();

    // =============================================================================
    // Widgets

    fireEvent.click(wrapper.getByTestId("next"));
    expect(wrapper.getByTestId("current-page")).toHaveTextContent("5");
    expect(wrapper.getByText("Slide 5 - Widgets")).toBeInTheDocument();

    const counterNodes = () =>
      presentation.querySelectorAll(`.${counter.className}`);
    expect(counterNodes()).toHaveLength(1);
    expect(counterNodes()[0]).toHaveTextContent("4");

    fireEvent.click(presentation.querySelector(`.${counter.leftClassName}`)!);
    expect(counterNodes()[0]).toHaveTextContent("3");
    fireEvent.click(presentation.querySelector(`.${counter.rightClassName}`)!);
    expect(counterNodes()[0]).toHaveTextContent("4");

    const proportionNodes = () =>
      presentation.querySelectorAll(`.${proportion.className}`);
    expect(proportionNodes()).toHaveLength(1);
    expect(proportionNodes()[0]).toHaveTextContent("1/5");

    fireEvent.click(
      presentation.querySelector(`.${proportion.rightClassName}`)!
    );
    expect(proportionNodes()[0]).toHaveTextContent("2/5");
    fireEvent.click(
      presentation.querySelector(`.${proportion.leftClassName}`)!
    );
    expect(proportionNodes()[0]).toHaveTextContent("1/5");

    const checkboxNodes = () =>
      presentation.querySelectorAll(`.${checkbox.className}`);
    const checkedNodes = () =>
      presentation.querySelectorAll(`.${checkbox.checkedClassName}`);
    expect(checkboxNodes()).toHaveLength(1);
    expect(checkedNodes()).toHaveLength(0);

    fireEvent.click(checkboxNodes()[0]);
    expect(checkedNodes()).toHaveLength(1);

    fireEvent.click(checkedNodes()[0]);
    expect(checkedNodes()).toHaveLength(0);

    // =============================================================================
    // Variables

    fireEvent.click(wrapper.getByTestId("next"));
    expect(wrapper.getByTestId("current-page")).toHaveTextContent("6");
    expect(wrapper.getByText("Slide 6 - Variables")).toBeInTheDocument();

    // =============================================================================
    // Toggle

    fireEvent.click(wrapper.getByTestId("next"));
    expect(wrapper.getByTestId("current-page")).toHaveTextContent("7");
    expect(wrapper.getByText("Slide 7 - Toggle")).toBeInTheDocument();

    expect(presentation.querySelectorAll(`.${folded.className}`)).toHaveLength(
      3
    );
    expect(presentation.querySelectorAll(`.${opened.className}`)).toHaveLength(
      0
    );

    fireEvent.click(presentation.querySelector(`.${folded.classNameOpening}`)!);
    expect(presentation.querySelectorAll(`.${folded.className}`)).toHaveLength(
      0
    );
    expect(presentation.querySelectorAll(`.${opened.className}`)).toHaveLength(
      3
    );

    fireEvent.click(presentation.querySelector(`.${opened.className}`)!);
    expect(presentation.querySelectorAll(`.${opened.className}`)).toHaveLength(
      0
    );
    expect(presentation.querySelectorAll(`.${folded.className}`)).toHaveLength(
      3
    );

    fireEvent.click(wrapper.getByTestId("next"));
    await waitFor(() =>
      expect(
        presentation.querySelectorAll(`.${folded.className}`)
      ).toHaveLength(0)
    );
    expect(presentation.querySelectorAll(`.${opened.className}`)).toHaveLength(
      3
    );

    fireEvent.click(wrapper.getByTestId("prev"));
    expect(wrapper.getByTestId("current-page")).toHaveTextContent("6");
  });
});
