import { ifThen, switchCounter, whileLoop } from "../generator/condition"
import { build, draw, drawflush, operation, read, variable } from "../generator/core"
import { generateIO } from "../generator/private/io"

const dspSize = 160
const size = 96
const scalep = 20
const mapw = 96
const maph = 96

const ioCell = build("cell1")
const io = generateIO(ioCell, {
    offX: 0,
    offY: 1,

    viewX: 2,
    viewY: 3,
    scale: 4
})

const offX = io.offX()
const offY = io.offY()

const uw = operation("div", 1, mapw).get().mul(dspSize)
const uh = operation("div", 1, maph).get().mul(dspSize)

draw.clear(0, 0, 0)
// draw.color(64, 128, 32, 255)
// const w = operation("div", size, mapw).get().mul(dspSize)
// const h = operation("div", size, maph).get().mul(dspSize)
// const x = io.offX().toDiv(mapw).mul(dspSize)
// const y = io.offY().toDiv(maph).mul(dspSize)
// draw.rect(x, y, w, h)
draw.color(64, 64, 64, 255)
draw.rect(0, 0, dspSize, dspSize)
const i = variable().set(16)
const j = variable().set(4)
whileLoop(() => read(ioCell, i).get().notEqual(0), () => {
    const stat = read(ioCell, i).get()
    switchCounter(stat, 1, [() => draw.color(0, 0, 0, 0), () => draw.color(255, 0, 0, 255), () => draw.color(255, 255, 0, 255), () => draw.color(0, 255, 0, 255)])
    draw.rect(dspSize + 4, j, 8, 8)
    ifThen(stat.notEqual(1), () => {
        const w = read(ioCell, i.toAdd(3)).get().mul(uw)
        const h = read(ioCell, i.toAdd(3)).get().mul(uh)
        const x = read(ioCell, i.toAdd(1)).get().mul(uw)
        const y = read(ioCell, i.toAdd(2)).get().mul(uh)
        draw.color(0, 255, 0, 255)
        draw.stroke(1)
        draw.lineRect(x, y, w, h)
        x.add(w)
        draw.color(255, 255, 0, 64)
        draw.line(dspSize + 4, j, x, y)
        y.add(h)
        draw.line(dspSize + 4, j.toAdd(8), x, y)
        const x1 = read(ioCell, i.toAdd(4)).get().mul(uw)
        const y1 = read(ioCell, i.toAdd(5)).get().mul(uh)
        draw.color(255, 255, 0, 255)
        draw.rect(x1, y1, uw, uh)
    })
    j.add(12)
    i.add(6)
})
draw.color(255, 255, 0, 255)
draw.stroke(1)
const viewW = io.scale().toMul(scalep).mul(uw)
const viewH = io.scale().toMul(scalep).mul(uh)
const viewX = io.viewX().mul(uw)/*.add(x)*/
const viewY = io.viewY().mul(uh)/*.add(y)*/
draw.lineRect(viewX, viewY, viewW, viewH)

drawflush(build("display1"))