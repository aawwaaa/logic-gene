import { ifThen } from "../generator/condition"
import { block, build, draw, drawflush, operation, print, prop, sensor, time, variable } from "../generator/core"
import { bar, numberDisplay } from "../generator/private/draw"

const display = numberDisplay()

const input = sensor(build("node1"), prop("powerNetIn")).get()
const output = sensor(build("node1"), prop("powerNetOut")).get()
const sto = sensor(build("node1"), prop("powerNetStored")).get()
const cap = sensor(build("node1"), prop("powerNetCapacity")).get()

draw.color(0, 0, 0, 255)
draw.rect(0, 61, 80, 80 - 61)

draw.stroke(1)

const lastT = variable()
const lastS = variable()

const total = input.toSub(output)
const per = sto.toDiv(cap)
const deltaT = time.toSub(lastT).div(1000)
const deltaS = sto.toSub(lastS)

lastT.set(time)
lastS.set(sto)

const sChange = deltaS.toDiv(deltaT)
const leftTime = variable()
ifThen(sChange.greaterThanEq(0), () => {
    const left = cap.toSub(sto)
    operation("div", left, sChange).to(leftTime)
}, () => {
    operation("div", sto, sChange).to(leftTime)
})

const moreIn = input.mul(1000).toMod(1000)
input.div(1000).floor()

draw.color(0, 255, 0, 255)
display.number(63,72,8,2,input)
display.dightedNumber(80,72,6,2,3,moreIn)

const moreOut = output.mul(1000).toMod(1000)
output.div(1000).floor()

draw.color(255, 0, 0, 255)
display.number(63,62,8,2,output)
display.dightedNumber(80,62,6,2,3,moreOut)

drawflush(build("display1"))
draw.color(0, 0, 0, 255)
draw.rect(0, 41, 80, 62 - 42)

ifThen(total.lessThan(0), () => {
    draw.color(255, 0, 0, 255)
}, () => ifThen(total.equal(0), () => {
    draw.color(255, 255, 0, 255)
}, () => {
    draw.color(0, 255, 0, 255)
}))

total.abs()
const moreTotal = total.mul(1000).toMod(1000)
total.div(1000).floor()

display.number(63,52,8,2,total)
draw.color(255, 255, 255, 255)
display.dightedNumber(80,52,6,2,3,moreTotal)

const moreSto = sto.mul(1000).toMod(1000)
sto.div(1000)

draw.color(255, 255, 0, 255)
display.number(63,42,8,2,sto.toFloor())
display.dightedNumber(80,42,6,2,3,moreSto)

drawflush(build("display1"))

draw.color(0, 0, 0, 255)
draw.rect(0, 0, 80, 41)
draw.color(255, 255, 0, 255)

const moreCap = cap.mul(1000).toMod(1000)
cap.div(1000)

display.number(63,32,8,2,cap.toFloor())
draw.color(255, 255, 255, 255)
display.dightedNumber(80,32,6,2,3,moreCap)

bar(1,21,78,9,1,[192,192,64],sto,cap)

per.mul(100000).floor()
const more = per.toMod(1000)
per.div(1000).floor()

draw.color(255, 255, 0, 255)
ifThen(per.greaterThanEq(45), () => {
    draw.color(32, 32, 32, 255)
})
display.number(40,24,4,2,per)
draw.color(255, 255, 0, 255)
ifThen(per.greaterThanEq(65), () => {
    draw.color(32, 32, 32, 255)
})
display.dightedNumber(57,24,4,2,3,more)

ifThen(sChange.greaterThan(0), () => {
    draw.color(0, 255, 0, 255)
    draw.triangle(3, 12, 7, 12, 5, 17)
}, () => ifThen(sChange.equal(0), () => {
    draw.color(255, 255, 0, 255)
    draw.rect(3, 13, 4, 4)
}, () => {
    draw.color(255, 0, 0, 255)
    draw.triangle(3, 17, 7, 17, 5, 12)
}))

leftTime.abs()
const moreLeftTime = leftTime.mul(1000).toMod(1000)
leftTime.div(1000)

draw.color(255, 255, 255, 255)
display.number(63,12,8,2,leftTime.toFloor())
display.dightedNumber(80,12,6,2,3,moreLeftTime)

drawflush(build("display1"))