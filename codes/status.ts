import { ifThen } from "../generator/condition";
import { build, draw, drawflush } from "../generator/core";
import { numberDisplay } from "../generator/private/draw";
import { generateIO } from "../generator/private/io";

const display = numberDisplay()

const status = generateIO(build("cell1"), {
    health: 0,
    mana: 1,
    charge: 2,
    overloaded: 3,
    special: 4
})

draw.color(0, 0, 0, 255)
draw.rect(0, 176 - 32, 176, 32)

draw.color(0, 255, 0, 255)
const healthPer = status.health().div(200)
draw.rect(10, 176 - 8, healthPer.mul(120), 6)

draw.color(64, 128, 255, 255)
const manaPer = status.mana().div(200)
draw.rect(10, 176 - 16, manaPer.mul(120), 6)

ifThen(status.overloaded().notEqual(0), () => {
    draw.color(255, 64, 32, 255)
}, () => {
    draw.color(255, 255, 128, 255)
})
const chargePer = status.charge().div(100)
draw.rect(10, 176 - 24, chargePer.mul(120), 6)

draw.color(255, 255, 0, 255)
draw.stroke(2)
display.number(170, 176 - 24, 16, 2, status.special())

drawflush(build("display1"))
