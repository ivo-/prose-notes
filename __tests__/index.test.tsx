import { screen, waitFor } from "@testing-library/react";
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
import todo from "../src/editor/decorations/todo";
import code, { highlightClassName } from "../src/editor/decorations/code";
import counter from "../src/editor/decorations/counter";
import proportion from "../src/editor/decorations/proportion";
import checkbox from "../src/editor/decorations/checkbox";
import date from "../src/editor/decorations/date";
import datetime from "../src/editor/decorations/datetime";
import duration from "../src/editor/decorations/duration";
import folded from "../src/editor/decorations/folded";
import tableRow from "../src/editor/decorations/table-row";
import opened from "../src/editor/decorations/opened";
import url from "../src/editor/decorations/url";
import _var from "../src/editor/decorations/var";
import img from "../src/editor/decorations/img";
import { ProseDecoration } from "../src/editor/types";
import { PREVIEW_CONTAINER_ID } from "../src/editor/constants";

const fullFeatures = `
# Hello, world!
## Hello, world!

*bold* text               pre*bold*post pre*bold* *bold*post
/italic/ text             pre/italic/post pre/italic/ /italic/post
_underlined_ text         pre_underlined_post pre_underlined_ _underlined_post
~strikethrough~ text      pre~strikethrough~post pre~strikethrough~ ~strikethrough~post
\`highlighted\` text      pre\`highlighted\`post pre\`highlighted\` \`highlighted\`post

http://google.com link
[google](http://google.com) like with title
    
#apple tag 

> Roses are red
> Violets are blue
> Some poems rhymes
> But this one doesn't!

---

1. John Cena
2. The Rock
3. The Undertaker
4. Kane
5. Jeff Hardy

* Apples
* Oranges
* Peaches

- Call your parents
+ Tell your kids you love them
- Hug your partner

\`\`\`javascript
var a = 10;
var b = 20;
alert(a + b);
*bold* text
- [ ] Todo
# heading
...
fold
...
\`\`\`

counter [51]
quantity [71/88]

checked [+]
unchecked [-]

date 2020-01-30
date and time 2019-12-20 11:30
repeating mon-fri 13:30 | everyday 08:17 | mon 19:20

duration 1h30m10s | 1h | 1h30m | 30m | 30m10s | 10s 

...
folded
...

....
unfolded
....

| table row |
|-----------|

${"{{a = 10}}"}
${"{{a + 10}}"}

![https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg]
`;

describe("index", () => {
  it("renders all the features", async () => {
    await render(fullFeatures);
    await waitFor(() => {
      expect(screen.getByText("Add New")).toBeInTheDocument();
    });

    await exists(heading, 2);
    await existsHeading(1, 1);
    await existsHeading(2, 1);

    await exists(bold, 2);
    await exists(italic, 2);
    await exists(underline, 2);
    await exists(strikethrough, 2);
    await exists(highlight, 2);

    await exists(link, 1);
    await exists(url, 2); // link also contains an url
    await exists(tag, 1);
    await exists(hr, 1);
    await exists(quote, 4);
    await exists(ordered, 5);
    await exists(bullet, 3);
    await exists(todo, 3);
    await exists(code, 11);

    await exists(counter, 1);
    await exists(proportion, 1);
    await exists(checkbox, 2);
    await exists(date, 3);
    await exists(datetime, 2);
    await exists(duration, 6);

    await exists(folded, 3);
    await exists(opened, 3);

    await exists(tableRow, 2);
    await exists(_var, 2);

    await exists(img, 1);
  });

  it("renders preview of all the features", async () => {
    await render(fullFeatures);
    await waitFor(() => {
      expect(screen.getByText("Add New")).toBeInTheDocument();
    });

    await exists(heading, 2);

    await view("Preview");
    const wrapper = document.querySelector(`#${PREVIEW_CONTAINER_ID}`)!;
    expect(wrapper).not.toBeNull();

    await existsStripped(wrapper, bold, 2, "*");
    await existsStripped(wrapper, italic, 2, "/");
    await existsStripped(wrapper, underline, 2, "_");
    await existsStripped(wrapper, strikethrough, 2, "~");
    await existsStripped(wrapper, highlight, 2, "`");
    await existsStripped(wrapper, quote, 4, ">");

    const existsEmpty = (deco: ProseDecoration, count: number) =>
      waitFor(() => {
        const elements = wrapper.querySelectorAll(`.${deco.className}`);
        expect(elements).toHaveLength(count);
        elements.forEach((el) => {
          expect(el.innerHTML).toBe("");
        });
      });

    await existsEmpty(_var, 2);
    await existsEmpty(hr, 1);

    expect(wrapper.querySelectorAll(`.${code.className}`)).toHaveLength(0);
    expect(wrapper.querySelectorAll(`.${highlightClassName}`)).toHaveLength(1);
  });

  it("renders wrapped decoration", async () => {
    await render(`
      *Tue*
    `);
    await waitFor(() => {
      expect(screen.getByText("Add New")).toBeInTheDocument();
    });

    await exists(bold, 3);
    await exists(date, 1);

    await view("Preview");
    const wrapper = document.querySelector(`#${PREVIEW_CONTAINER_ID}`)!;
    expect(wrapper).not.toBeNull();

    await existsStripped(wrapper, bold, 3, "*");
    expect(wrapper.querySelectorAll(`.${date.className}`)).toHaveLength(1);

    const elements = wrapper.querySelectorAll(`.${bold.className}`);
    expect(elements).toHaveLength(3);
    elements.forEach((el) => {
      expect(el.textContent === "" || el.textContent === "Tue").toBe(true);
    });
  });
});

const existsStripped = (
  wrapper: Element,
  deco: ProseDecoration,
  count: number,
  char: string
) =>
  waitFor(() => {
    const elements = wrapper.querySelectorAll(`.${deco.className}`);
    expect(elements).toHaveLength(count);
    elements.forEach((el) => {
      expect(el.innerHTML.startsWith(char)).toBe(false);
      expect(el.innerHTML.endsWith(char)).toBe(false);
    });
  });
