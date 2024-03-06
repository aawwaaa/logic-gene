import { ifThen, whileLoop } from "../../generator/condition";
import { build, time, variable } from "../../generator/core";
import { data } from "../../generator/data";
import { generateIO } from "../../generator/private/io";

const p1Cell = build("cell1")
const p2Cell = build("cell2")

const opt = {
    uPower: 0,
    powerT: 1,
    rAfter: 2,
    rBefore: 3,
    stackForward: 4,
    stackBackward: 5
}

const p2 = generateIO(p2Cell, opt)
const p1 = generateIO(p1Cell, opt)

ifThen(p1.powerT().greaterThan(p2.powerT()), () => {
    update(p1Cell, p2Cell)
}, () => {
    update(p2Cell, p1Cell)
})

function update(from, to){
    const p1 = generateIO(from, opt)
    const p2 = generateIO(to, opt)
    p2.uPower(p1.uPower())
    p2.powerT(p1.powerT())
    p1.rAfter(p2.rAfter())
    p2.rBefore(p1.rBefore())
    p2.stackForward(p1.stackForward())
    p1.stackBackward(p2.stackBackward())
    data.copy(from, 8, to, 8, p1.stackForward().toSub(8))
    data.copy(to, 8 + 56 / 2, from, 8 + 56 / 2, p1.stackBackward().toSub(8 + 56 / 2))
}