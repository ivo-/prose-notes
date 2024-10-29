import { Howl } from "howler";

const click = new Howl({
  volume: 0.3,
  src: ["./click.mp3"],
  html5: true,
});

const alarm = new Howl({
  volume: 0.9,
  src: ["./alarm.mp3"],
  html5: true,
});

export default {
  click: () => process.env.NODE_ENV !== "test" && click.play(),
  alarm: () => process.env.NODE_ENV !== "test" && alarm.play(),
};
