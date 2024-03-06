import { ifNot, ifThen, init } from "../generator/condition";
import { block, build, draw, drawflush, end, jumpToAfter, operation, variable } from "../generator/core";
import { getTouchPos } from "../generator/private/touch";

const [sx, sy, si] = getTouchPos(build("arc1"), build("display1"))

const util = variable()
const size = variable()

init(() => {
    size.set(1)
})

draw.color(0, 0, 0, 255)
draw.rect(160, 0, 16, 176)
draw.color(255, 255, 255, 255)
draw.image(168, 168, block("incinerator"), 12, 0)
draw.image(168, 168 - 16, block("arc"), 12, 0)
draw.image(168, 168 - 32, block("duo"), 12, 0)
draw.line(168, 168 - 48, 168, 16)
const y = size.toDiv(10).mul(168 - 48 - 16).add(16)
draw.poly(168, y, 4, 4, 0)
draw.color(255, 255, 0, 255)
ifThen(util.equal(0), () => {
    draw.lineRect(160, 160 - 16, 16, 16)
}, () => {
    draw.lineRect(160, 160 - 32, 16, 16)
})
drawflush(build("display1"))

ifNot(si.notEqual(0), end)

let m;
ifNot(sx.lessThan(160), () => {
    m = jumpToAfter(sx.greaterThan(176))
    let a;
    ifNot(sy.lessThan(160), () => {
        a = jumpToAfter(sy.greaterThan(176))
        draw.clear(0, 0, 0)
        drawflush(build("display1"))
        end()
    })
    a.here()
    ifNot(sy.lessThan(160 - 16), () => {
        a = jumpToAfter(sy.greaterThan(176 - 16))
        util.set(0)
        end()
    })
    a.here()
    ifNot(sy.lessThan(160 - 32), () => {
        a = jumpToAfter(sy.greaterThan(176 - 32))
        util.set(1)
        end()
    })
    a.here()
    ifNot(sy.lessThan(16), () => {
        a = jumpToAfter(sy.greaterThan(176 - 48))
        size.set(sy.sub(16).div(176 - 48 - 16).mul(11)).floor()
        end()
    })
    a.here()
    end()
})
m.here()

ifThen(util.equal(0), () => {
    draw.color(255, 255, 255, 255)
}, () => {
    draw.color(0, 0, 0, 255)
})
draw.poly(sx, sy, 4, size, 45)
drawflush(build("display1"))