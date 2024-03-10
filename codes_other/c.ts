import { ifThen, whileLoop } from "../generator/condition"
import { build, draw, drawflush, operation, variable } from "../generator/core"

const x = variable().set(0)
const y = variable().set(0)

const step = variable().set(0.001)
const size = variable().set(16)

const i = variable().set(0)

const s = operation("div", 176, size).get()

whileLoop(i.lessThan(size.toMul(size)), () => {
    const dx = i.toMod(size)
    const dy = i.toDiv(size).floor()

    const wx = dx.toAdd(x).div(step)
    const wy = dy.toAdd(y).div(step)

    dx.mul(s)
    dy.mul(s)

    const value = operation("noise", wx, wy).get()

    value.mul(255)

    ifThen(value.greaterThan(0), () => {
        draw.color(value, 0, 0, 255)
    }, () => {
        draw.color(0, 0, value, 255)
    })
    draw.rect(dx, dy, s, s)

    i.add(1)
    drawflush(build("display1"))
})