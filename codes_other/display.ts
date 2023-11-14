import { whileLoop, ifThen, switchCounter } from "../generator/condition"
import { Value, Var, block, build, draw, drawflush, getlink, lookup, operation, print, printflush, prop, read, sensor, unit, variable, write } from "../generator/core"
import { generateIO } from "../generator/private/io"

const part = variable("part").set(0)
const parts = variable("parts").set(2)

const col = 96
const scalep = 20

const ioCell = build("cell1")
const io = generateIO(ioCell, {
    offX: 0,
    offY: 1,

    viewX: 2,
    viewY: 3,
    scale: 4,

    size: 8
})

const bankBegin = 2

function crossBankRead(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return read(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"))
}

function crossBankWrite(addr: Var<number>, data: Value<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return write(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"), data)
}

const windowSize = io.scale().toMul(scalep)
const x = io.viewX()
const maxX = x.toAdd(windowSize).ceil()
const y = io.viewY()

const rowsEveryPart = windowSize.toDiv(parts).ceil()
y.add(rowsEveryPart.toMul(part))

const maxY = y.toAdd(rowsEveryPart).ceil() 

const drawSize = operation("div", 176, io.scale().mul(scalep)).get().floor()
io.size(drawSize)
const drawSize2 = drawSize.toDiv(2)
const drawSize3 = drawSize2.toSub(2)

const drawX = x.toMod(1).add(drawSize2)
const drawY = y.toMod(1).add(drawSize2)

drawY.add(drawSize.toMul(part).toMul(rowsEveryPart))

x.floor()
y.floor()

whileLoop(y.lessThanEq(maxY), () => {
    draw.color(0, 0, 0, 255)
    draw.rect(0, drawY.toSub(drawSize2), 176, drawSize)
    draw.color(255, 255, 255, 255)
    whileLoop(x.lessThanEq(maxX), () => {
        const i = y.toMul(col).add(x.toFloor())
        const data = crossBankRead(i).get()
        ifThen(data.equal(0), () => {
            draw.color(255, 0, 0, 255)
            draw.linePoly(drawX, drawY, 4, drawSize3, 0)
            draw.color(255, 255, 255, 255)
        }, () => {
            const rot = data.toAnd(0x3)
            const config = data.shr(2).toAnd(0x3ff)
            const floor = data.shr(10).toAnd(0xf)
            const size = data.shr(4).toAnd(0xf)
            const bl = data.shr(4).toAnd(0x3ff)
            ifThen(bl.equal(1023), () => bl.set(block("air")), () => 
                ifThen(bl.equal(1022), () => bl.set(block("solid")), () => lookup("block", bl).to(bl)))
            ifThen(floor.notEqual(15), () => {
                switchCounter(floor, 1, [
                    () => draw.color(32, 32, 32, 255),
                    () => draw.color(64, 128, 255, 255),
                    () => draw.color(255, 192, 64, 255),
                    () => draw.color(120, 220, 32, 255),
                    () => draw.color(192, 192, 255, 255),
                    () => draw.color(128, 128, 192, 255),
                    () => draw.color(255, 255, 192, 255),
                    () => draw.color(96, 96, 32, 255),
                    () => draw.color(128, 255, 64, 255),
                    () => draw.color(32, 64, 128, 255),
                ])
                draw.poly(drawX, drawY, 4, drawSize3, 0)
                draw.color(255, 255, 255, 255)
            }, () => {
                draw.color(128, 128, 128, 255)
                draw.linePoly(drawX, drawY, 4, drawSize3, 0)
                draw.color(255, 255, 255, 255)
            })
            ifThen(bl.notEqual(block("air")), () => {
                ifThen(bl.equal(block("solid")), () => {
                    draw.color(128, 128, 128, 255)
                    draw.poly(drawX, drawY, 4, drawSize3, 45)
                    draw.color(255, 255, 255, 255)
                }, () => {
                    ifThen(size.mod(2).equal(0), () => {
                        draw.image(drawX.toAdd(drawSize2), drawY.toAdd(drawSize2), bl, drawSize.toMul(size), rot.toMul(90))
                    }, () => {
                        draw.image(drawX, drawY, bl, drawSize.toMul(size), rot.toMul(90))
                    })
                    ifThen(config.notEqual(1023), () => {
                        ifThen(bl.equal(block("liquid-source")), () => lookup("liquid", config).to(config), () => 
                            lookup("item", config).to(config))
                        draw.image(drawX, drawY, config, drawSize2, 0)
                    })
                })
            })
        })
        x.add(1)
        drawX.add(drawSize)
    })
    io.viewX()
    operation("mod", x, 1).to(drawX)
    drawX.add(drawSize2)
    x.floor()
    drawY.add(drawSize)
    y.add(1)
    drawflush(build("display1"))
})
