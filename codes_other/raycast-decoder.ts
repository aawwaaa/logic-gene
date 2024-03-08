
import { ifThen, switchCounter, whileLoop } from "../generator/condition"
import { build, draw, drawflush, operation, read, variable } from "../generator/core"
import { generateIO } from "../generator/private/io"

const inputBank = build("bank1")
const dataCell = build("cell1")

const deltaAngle = 360 / 45
const fov = 120
const worldSize = 8
const blockSize = 32
const allRepeats = 360 / deltaAngle

const data = generateIO(dataCell, {
    x: 0,
    y: 1,
    angle: 8,
})

const colorR = variable().set(0)
const colorG = variable().set(0)
const colorB = variable().set(0)

const blockColors = [
    "#ff8800", "#6633aa", "#ffffff", "#aaaaff",
    "#ffffaa", "#000000", "#6855ff", "#cc77ff",
    "#666666", "#333333", "#88ff88", "#ffaa88",
    "#ffff66", "#8844ff", "#ffaa88", "#ff4422",
    "#44aa44", "#334477", "#aaffaa", "#8844aa"
].map(a => () => {
    const r = parseInt(a.substring(1, 3), 16)
    const g = parseInt(a.substring(3, 5), 16)
    const b = parseInt(a.substring(5, 7), 16)
    colorR.set(r)
    colorG.set(g)
    colorB.set(b)
})

draw.clear(0, 0, 0)

const index = variable().set(0)

const x = data.x().div(worldSize * blockSize).mul(176)
const y = data.y().div(worldSize * blockSize).mul(176)

whileLoop(() => index.lessThan(allRepeats), () => {
    const input = read(inputBank, index).get()
    const angle = data.angle().toAdd(index.toMul(deltaAngle).toSub(fov / 2)).mod(360)
    ifThen(input.notEqual(-1), () => {
        const distance = input.toMod(1 << 24)
        const block = input.toFloor().shr(24)
        switchCounter(block, 3, blockColors)
        const endX = x.toAdd(distance.toMul(angle.toCos()).div(worldSize * blockSize).mul(176))
        const endY = y.toAdd(distance.toMul(angle.toSin()).div(worldSize * blockSize).mul(176))
        draw.color(128, 192, 255, 255)
        draw.line(x, y, endX, endY)
        draw.color(colorR, colorG, colorB, 255)
        draw.poly(endX, endY, 4, 4, 0)
    })

    index.add(4)
})

draw.color(255, 255, 0, 255)
const rot = data.angle()
const x3 = rot.toCos().mul(32).add(x)
const y3 = rot.toSin().mul(32).add(y)
rot.sub(fov / 2)
const x1 = rot.toCos().mul(32).add(x)
const y1 = rot.toSin().mul(32).add(y)
rot.add(fov)
const x2 = rot.toCos().mul(32).add(x)
const y2 = rot.toSin().mul(32).add(y)
draw.poly(x, y, 8, 5, 0)
draw.color(255, 0, 0, 255)
draw.line(x, y, x1, y1)
draw.color(0, 0, 255, 255)
draw.line(x, y, x2, y2)
draw.color(0, 255, 0, 255)
draw.line(x, y, x3, y3)

drawflush(build("display1"))
