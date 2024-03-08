import { ifThen, switchCounter, whileLoop } from "../generator/condition"
import { build, draw, drawflush, operation, read, variable } from "../generator/core"
import { generateIO } from "../generator/private/io"

const inputBank = build("bank1")
const dataCell = build("cell1")

const deltaAngle = 360 / 45
const fov = 120
const repeat = fov / deltaAngle
const deltaX = 176 / repeat
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

draw.clear(64, 64, 64)
draw.color(128, 128, 128, 255)
draw.rect(0, 0, 176, 176 / 2)

const index = variable().set(0)
const x = variable().set(0)

whileLoop(() => index.notEqual(repeat), () => {
    const input = read(inputBank, index).get()
    ifThen(input.notEqual(-1), () => {
        const distance = input.toMod(1 << 24)
        const block = input.toFloor().shr(24)
        switchCounter(block, 3, blockColors)
        const colorKeep = operation("div", 1, distance.toDiv(24)).get().min(1)
        colorR.mul(colorKeep)
        colorG.mul(colorKeep)
        colorB.mul(colorKeep)
        const height = distance.toMul(-1).mul(1.5).add(230).max(0).min(176)
        const y = operation("sub", 176 / 2, height.toDiv(2)).get()
        draw.color(colorR, colorG, colorB, 255)
        draw.rect(x, y, Math.ceil(deltaX), height)
    })

    index.add(1).mod(allRepeats)
    x.add(deltaX)
})

drawflush(build("display1"))
