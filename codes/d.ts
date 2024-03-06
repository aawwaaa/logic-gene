import { doWhileLoop, forLoop, ifThen, whileLoop } from "../generator/condition";
import { block, build, draw, drawflush, lookup, prop, sensor, thisProcessor, unit, unitBind, unitCount, unitType, variable } from "../generator/core";
import { numberDisplay } from "../generator/private/draw";

const display = numberDisplay()

const count = variable().set(0)
const players = variable().set(0)

forLoop(() => variable().set(0), v => v.lessThan(unitCount), v=>v.add(1), v => {
    const u = lookup("unit",v).get()
    const f = unitBind(u)
    doWhileLoop(f.notEqual(unit), br => {
        ifThen(sensor(f, prop("dead")).get().notEqual(0), br)
        count.add(1)
        ifThen(sensor(unit, prop("name")).get().notEqual(0), () => {
            players.add(1)
        })
        unitBind(u)
    })
})

const team = sensor(thisProcessor, prop("team")).get()

ifThen(players.notEqual(0), () => {
    draw.clear(255, 255, 255)
}, () => {
    draw.clear(0, 0, 0)
})

draw.color(255, 255, 255, 255)
draw.image(10, 70, block("core-shard"), 16, 0)
draw.image(10, 40, unitType("flare"), 16, 0)
draw.image(10, 10, unitType("gamma"), 16, 0)

draw.color(255, 128, 0, 255)
draw.stroke(2)
display.number(75, 62, 16, 4, team)
display.number(75, 32, 16, 4, count)
display.number(75, 2, 16, 4, players)

drawflush(build("display1"))