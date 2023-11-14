import { ifThen, switchCounter, switchValue } from "../generator/condition"
import { block, build, color, draw, drawflush, item, liquid, operation, packColor, read, variable } from "../generator/core"

const max = 5
const cell = build("cell1")

const i = variable()

const stoA = switchValue(i, [2, 4, 6, 8, 0]).get()
const capA = switchValue(i, [3, 5, 7, 9, 1]).get()
const ico = switchValue(i, [liquid("slag"), liquid("arkycite"), liquid("water"), block("battery"), liquid("ozone")]).get()
const col = variable()
switchCounter(i, 1, [
    () => packColor(4/4, 3/4, 2/4, 1).to(col),
    () => packColor(2/4, 3/4, 2/4, 1).to(col),
    () => packColor(2/4, 3/4, 4/4, 1).to(col),
    () => packColor(4/4, 4/4, 2/4, 1).to(col),
    () => packColor(3/4, 2/4, 4/4, 1).to(col),
])

const sto = read(cell, stoA).get()
const cap = read(cell, capA).get()
const mul = sto.toDiv(cap)
const wid = mul.toMul(80 - 10 - 2 * 2, "wid").floor()

const y = operation("sub", 80, i.toMul(10)).get()
const y1 = y.toSub(10)
const y2 = y1.toAdd(5)

draw.color(255,255,255,255)
draw.image(5, y2, ico, 8, 0)
draw.stroke(1)
draw.lineRect(10 + 1, y1.toAdd(1), 80 - 10 - 2, 10 - 2)
draw.col(col)
draw.rect(12, y1.toAdd(2), wid, 10 - 2 * 2)

i.add(1).mod(max)

ifThen(i.equal(0), () => {
    drawflush(build("display1"))
    draw.clear(0, 0, 0)
})