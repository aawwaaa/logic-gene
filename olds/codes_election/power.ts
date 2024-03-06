import { ifThen } from "../../generator/condition";
import { build, time, variable } from "../../generator/core";
import { generateIO } from "../../generator/private/io";

const negativeCell = build("cell1")
const positiveCell = build("cell2")

const u = variable("U").set(1.5)

const opt = {
    uPower: 0,
    powerT: 1,
    rAfter: 2,
    rBefore: 3,
    stackForward: 4,
    stackBackward: 5
}

const positive = generateIO(positiveCell, opt)
const negative = generateIO(negativeCell, opt)

ifThen(negative.powerT().greaterThan(time), () => {
    positive.uPower(negative.uPower().add(u))
}, () => {
    positive.uPower(u)
})
positive.stackForward(8)
positive.stackBackward(8 + 56 / 2)
positive.powerT(time.toAdd(500))