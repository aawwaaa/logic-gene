import { build, draw, drawflush } from "../generator/core";
import { numberDisplay } from "../generator/private/draw";

const display = numberDisplay()

draw.clear(0, 0, 0)
draw.color(255, 255, 255, 255)
display.number(100, 10, 10, 2, 1234567)

drawflush(build("display1"))
