import { ifThen } from "../generator/condition"
import { build, draw, drawflush, operation, time, unitType, variable } from "../generator/core"
import { generateIO } from "../generator/private/io"

const data = generateIO(build("cell1"), {
    health: 0,
    bulletPos: 32,
    laser: 33,
    summon: 34,
    damage: 48,
    shielded: 49,
    breakShield: 50,
    reset: 63
})

const other = generateIO(build("cell2"), {
    bulletPos: 32,
    laser: 33,
    summon: 34,
    damage: 48,
    shielded: 49,
    breakShield: 50,
    reset: 63
})

ifThen(data.health().lessThanEq(0), () => {
    draw.color(255, 0, 0, 16)
}, () => {
    draw.color(0, 0, 0, 16)
})
draw.rect(0, 0, 176, 176 - 32)

draw.color(255, 255, 64, 255)
draw.poly(0, 88, 6, 16, 30)

ifThen(data.bulletPos().notEqual(-1), () => {
    const pos = data.bulletPos().add(26)
    ifThen(pos.lessThan(176), () => {
        draw.poly(pos, 88, 16, 8, 0)
    })
})

const laserLeft = variable().set(16)

ifThen(data.shielded().notEqual(0), () => {
    draw.stroke(2)
    draw.line(20, 73, 20, 103)
    draw.line(20, 73, 25, 88)
    draw.line(20, 103, 25, 88)
    laserLeft.set(32)
})

draw.color(32, 96, 255, 255)

ifThen(other.bulletPos().notEqual(-1), () => {
    const pos = operation("sub", 300, other.bulletPos()).get().add(26)
    ifThen(pos.lessThan(176), () => {
        draw.poly(pos, 88, 16, 8, 0)
    })
})

draw.color(255, 128, 64, 255)

ifThen(data.laser().notEqual(-1), () => {
    draw.stroke(data.laser().mul(8).add(4))
    draw.line(32, 88, 176, 88)
})

ifThen(other.laser().notEqual(-1), () => {
    draw.stroke(other.laser().mul(8).add(4))
    draw.line(laserLeft, 88, 176, 88)
})

draw.color(255, 192, 128, 255)

ifThen(data.laser().notEqual(-1), () => {
    draw.stroke(data.laser().mul(8))
    draw.line(32, 88, 176, 88)
})

ifThen(other.laser().notEqual(-1), () => {
    draw.stroke(other.laser().mul(8))
    draw.line(laserLeft, 88, 176, 88)
})

draw.color(128, 64, 255, 255)

ifThen(data.summon().notEqual(-1), () => {
    draw.stroke(2)
    draw.linePoly(88, 88, 16, 48, 0)
    const base = time.toDiv(20).mod(360)
    function calcPoint(delta: number){
        const angle = base.toAdd(delta)
        return [angle.toCos().mul(48).add(88), angle.toSin().mul(48).add(88)]
    }
    const [x1, y1] = calcPoint(0)
    const [x2, y2] = calcPoint(360 / 5)
    const [x3, y3] = calcPoint(360 / 5 * 2)
    const [x4, y4] = calcPoint(360 / 5 * 3)
    const [x5, y5] = calcPoint(360 / 5 * 4)
    draw.line(x1, y1, x3, y3)
    draw.line(x2, y2, x4, y4)
    draw.line(x3, y3, x5, y5)
    draw.line(x4, y4, x1, y1)
    draw.line(x5, y5, x2, y2)

    draw.color(255, 255, 255, 255)
    const size = data.summon().div(12).mul(96).min(96)
    draw.image(88, 88, unitType("corvus"), size, 270)

    ifThen(data.summon().greaterThan(12), () => {
        draw.color(64, 192, 64, 255)
        draw.stroke(32)
        draw.line(88, 88, 176, 88)
        draw.color(128, 255, 128, 255)
        draw.stroke(24)
        draw.line(88, 88, 176, 88)
    })
})

ifThen(other.summon().greaterThan(12), () => {
    draw.color(64, 192, 64, 255)
    draw.stroke(32)
    draw.line(16, 88, 176, 88)
    draw.color(128, 255, 128, 255)
    draw.stroke(24)
    draw.line(16, 88, 176, 88)
})

drawflush(build("display1"))
