import { doWhileLoop, ifNot, ifThen, whileLoop } from "../generator/condition";
import { Var, build, draw, drawflush, end, getlink, lookup, operation, read, variable } from "../generator/core";
import { generateIO } from "../generator/private/io";

const io = generateIO(build("cell1"), {
    enable: 8,
    y: 9,
    offset: 10,
    scale: 11,
    bias: 12,
    timeScale: 13,
    standardTime: 14
})

const timeToPixel = 2
const height = 40 - 6

const bankBegin = 1

function crossBankRead(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return read(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"))
}

ifNot(io.enable().notEqual(0), end)

const x = variable().set(-1)
const y = io.y()
const y2 = y.toAdd(3)
const lastX = variable().set(-1)
const lastY = variable().set(0)
const p = io.offset()
const scale = io.scale()
const bias = io.bias()
const timeScale = io.timeScale()

draw.color(0, 0, 0, 255)
draw.rect(10, y, 166, height)
draw.color(255, 255, 255, 255)
doWhileLoop(x.lessThan(170), () => {
    const count = crossBankRead(p).get()
    p.add(1)
    const time = crossBankRead(p).get()
    p.add(1)
    const item = lookup("item", count.toAnd(0xff)).get()
    const deltaT = time.toAnd(0xff)
    time.shr(8)
    count.shr(8)
    deltaT.mul(timeToPixel).mul(timeScale)
    ifThen(x.equal(-1), () => {
        const t = time.toSub(io.standardTime()).mul(timeToPixel)
        operation("mul", t, timeScale).to(x)
    })
    deltaT.add(x)
    ifThen(count.notEqual(0), () => {
        draw.image(x, y2, item, 6, 0)
    })
    count.add(bias).mul(scale).div(10).mul(height)
    count.add(y).add(6)
    draw.line(x, count, deltaT, count)
    ifThen(lastX.notEqual(0), () => {
        draw.line(lastX, lastY, x, y)
    })
    lastX.set(x)
    lastY.set(count)
    x.set(deltaT)
})
drawflush(build("display1"))