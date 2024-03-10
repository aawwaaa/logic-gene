import { forLoop, ifThen } from "../generator/condition";
import { build, draw, drawflush, getlink, itemCount, lookup, prop, sensor, variable } from "../generator/core";
import { bar } from "../generator/private/draw";

const target = getlink(1).get()
const y = variable().set(80 - 8)

draw.clear(0, 0, 0)

const b = sensor(target, prop("itemCapacity")).get()

forLoop(() => variable().set(0), v=>v.lessThan(itemCount), v=>v.add(1), v => {
    const i = lookup("item", v).get()
    const a = sensor(target, i).get()
    ifThen(a.notEqual(0), () => {
        const y1 = y.toAdd(4)
        draw.color(255, 255, 255, 255)
        draw.image(4, y1, i, 6, 0)
        const mul = a.toDiv(b)
        const wid = mul.toMul(70 - 1 * 2, "wid").floor()
        
        draw.stroke(1)
        draw.lineRect(9, y.toAdd(1), 70, 6)
        draw.color(128, 128, 128, 255)
        draw.rect(9 + 1, y.toAdd(2), wid, 6 - 1 * 2)

        y.sub(8)
    })
})

drawflush(build("display1"))