import * as chrono from "chrono-node";
import { Fragment } from "prosemirror-model";
import { InputRule, inputRules } from "prosemirror-inputrules";
import schema from "./schema";

export function formatDate(d: Date) {
  let month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

export function getDaysInMonth(month: number, year: number) {
  const date = new Date(Date.UTC(year, month, 1));
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function getDaysInMonthByWeeks(month: number, year: number) {
  const days = getDaysInMonth(month, year);
  const weeks: (Date | null)[][] = [];

  let currentWeek = 0;
  days.forEach((day) => {
    if (!weeks[currentWeek]) weeks[currentWeek] = [];
    weeks[currentWeek].push(day);

    if (day.getDay() === 0) {
      currentWeek++;
    }
  });
  const maxLen = Math.max(...weeks.map((w) => w.length));

  while (weeks[0].length !== maxLen) {
    weeks[0].unshift(null);
  }

  while (weeks[weeks.length - 1].length !== maxLen) {
    weeks[weeks.length - 1].push(null);
  }

  return weeks;
}

export function getZeroBasedNum(num: number) {
  return num < 10 ? `0${num}` : num;
}

export const monthNumToName = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const inputCalendarRule = new InputRule(
  /<calendar:?(\s?\d\d\d\d-\d\d?)?>/,
  function (state, match, start, end) {
    const { paragraph } = state.schema.nodes;
    let today = new Date();
    if (match[1]) {
      const [year, month] = match[1].split("-");
      today = new Date(Number(year), Number(month), 0);
    }

    const nodes = Fragment.from([
      paragraph.create(
        null,
        schema.text(
          `*${monthNumToName[today.getMonth()]} ${today.getFullYear()}*`
        )
      ),
      paragraph.create(
        null,
        schema.text(
          "|---------|---------|---------|---------|---------|---------|---------|"
        )
      ),
      paragraph.create(
        null,
        schema.text(
          "|  *Mon*  |  *Tue*  |  *Wed*  |  *Thu*  |  *Fri*  |  *Sat*  |  *Sun*  |"
        )
      ),
      paragraph.create(
        null,
        schema.text(
          "|---------|---------|---------|---------|---------|---------|---------|"
        )
      ),
      ...getDaysInMonthByWeeks(today.getMonth(), today.getFullYear()).map(
        (week) =>
          paragraph.create(
            null,
            state.schema.text(
              "| " +
                week
                  .map((d) =>
                    d ? `   ${getZeroBasedNum(d.getDate())}   ` : "        "
                  )
                  .join("| ") +
                "|"
            )
          )
      ),
      paragraph.create(
        null,
        schema.text(
          "|---------|---------|---------|---------|---------|---------|---------|"
        )
      ),
    ]);

    return state.tr.replaceWith(start, end, nodes);
  }
);

const inputDateRule = new InputRule(/<[^>]+>/, function (
  state,
  match,
  start,
  end
) {
  const insert = chrono.parseDate(match[0]);
  if (!insert) {
    return null;
  }

  return state.tr.insertText(formatDate(insert), start, end);
});

export default inputRules({ rules: [inputCalendarRule, inputDateRule] });
