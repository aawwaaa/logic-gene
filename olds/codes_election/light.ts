import { ifThen, whileLoop } from "../../generator/condition";
import { Building, Var, build, draw, drawflush, time, variable } from "../../generator/core";
import { data } from "../../generator/data";
import { generateIO } from "../../generator/private/io";

const r = variable("R").set(10)
const broken = variable()

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
    const rAfter = p2.rAfter()
    const rBefore = p1.rBefore().add(r)
    const uPower = p1.uPower()
    const total = rAfter.toAdd(rBefore)
    const i = uPower.toDiv(total)
    const powerT = p1.powerT()
    ifThen(broken.notEqual(0), () => {
        powerT.set(0)
        rAfter.set(0)
        rBefore.set(0)
    })
    const u = i.toMul(r)
    processConsume(u, i, total.opEqual(0), powerT.opGreaterThan(time))
    p2.uPower(uPower)
    p2.powerT(powerT)
    p1.rAfter(rAfter.add(r))
    p2.rBefore(rBefore)
    p2.stackForward(p1.stackForward())
    p1.stackBackward(p2.stackBackward())
    data.copy(from, 8, to, 8, p1.stackForward().toSub(8))
    data.copy(to, 8 + 56 / 2, from, 8 + 56 / 2, p1.stackBackward().toSub(8 + 56 / 2))
}

function processConsume(u: Var<number>, i: Var<number>, infI: Var<boolean>, enable: Var<boolean>){
    draw.clear(0, 0, 0)
    const consI = 0.2
    const maxI = 0.3
    ifThen(broken.notEqual(0), () => {
        draw.color(192, 192, 192, 255)
        draw.stroke(4)
        draw.line(0, 40, 25, 40)
        draw.line(55, 40, 80, 40)
    }, () => ifThen(enable.notEqual(0), () => {
        const c = i.toDiv(consI)
        const r = c.toMul(192)
        const b = c.toMul(64)
        ifThen(i.greaterThan(maxI), () => {
            broken.set(1)
        })
        draw.color(r, r, b, 255)
        draw.poly(40, 40, 20, 20, 0)
        draw.color(192, 192, 192, 255)
        draw.stroke(4)
        draw.line(0, 40, 80, 40)
    }, () => {
        draw.color(192, 192, 192, 255)
        draw.stroke(4)
        draw.line(0, 40, 80, 40)
    }))
    drawflush(build("display1"))
}