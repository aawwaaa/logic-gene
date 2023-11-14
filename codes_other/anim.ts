import { ifNot, ifThen, whileLoop } from "../generator/condition";
import { block, build, control, draw, drawflush, end, operation, print, printflush, prop, sensor, variable } from "../generator/core";

const total = variable().set(100)
const progress = variable()

const c = 0.8

const p = progress.toDiv(total).toMul(6 - (1 - c))

const y = p.toFloor()

const x = p.mod(1)

const mod = y.toMod(2)

y.add(x.toSub(c).div(1 - c).max(0).min(1))

x.div(c).min(1)

ifThen(mod.equal(1), () => operation("sub", 1, x).to(x))

y.mul(10).add(10)
x.mul(50).add(10)

const item = sensor(build("source1"), prop("config")).get()

draw.clear(0, 0, 0)
draw.color(255, 255, 255, 255)
draw.image(40, 40, item, 60, 0)
draw.color(0, 0, 0, 255)
draw.rect(0, y.toAdd(10), 80, 80)
ifThen(y.toMod(10).notEqual(0), () => {
    draw.rect(0, y.toDiv(10).ceil().mul(10), 80, 80)
})
ifThen(mod.equal(0), () => {
    draw.rect(x, y, 80, 80)
}, () => {
    draw.rect(0, y, x, 80)
})
draw.color(64, 64, 64, 255)
draw.rect(x.toAdd(3), 0, 4, 80)
draw.rect(0, y.toAdd(3), 80, 4)
draw.color(128, 128, 128, 255)
draw.rect(x, y, 10, 10)
drawflush(build("display1"))

const source = control(build("source1"))
source.enabled(false)

progress.add(1)

ifNot(progress.greaterThanEq(total), end)

const d = 80

const itemY = variable().set(40)
whileLoop(itemY.lessThan(40 + d), () => {
    const x = 10
    const y = operation("sub", 60, itemY.toSub(40).div(d).mul(50)).get()
    draw.clear(0, 0, 0)
    draw.color(255, 255, 255, 255)
    draw.image(40, itemY, item, 60, 0)
    draw.color(64, 64, 64, 255)
    draw.rect(x + 3, 0, 4, 80)
    draw.rect(0, y.toAdd(3), 80, 4)
    draw.color(128, 128, 128, 255)
    draw.rect(x, y, 10, 10)
    drawflush(build("display1"))
    itemY.add(1)
    source.enabled(itemY.toOpGreaterThan(40 + d - 4))
})

progress.set(0)