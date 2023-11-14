import { ifNot, ifThen, init, whileLoop } from "../generator/condition"
import { Var, read, getlink, Value, write, unitBind, unit, jumpToAfter, sensor, prop, unitType, jumpMark, build, time, variable, end, operation, block, thisProcessor, always } from "../generator/core"
import { generateIO } from "../generator/private/io"

const id = variable("id").set(0)
const y = id.toMul(16).add(8)

const di = id.toMul(6).add(16)

const ioCell = build("cell1")
const io = generateIO(ioCell, {
    offX: 0,
    offY: 1
})

const bankBegin = 1

function crossBankRead(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return read(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"))
}

function crossBankWrite(addr: Var<number>, data: Value<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return write(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"), data)
}

const m = jumpToAfter(sensor(unit, prop("dead")).get().notEqual(0))
const n = jumpToAfter(sensor(unit, prop("controller")).get().notEqual(thisProcessor))
ifNot(unit.notEqual(0), () => {
    const a = jumpMark()
    m.here()
    n.here()
    unitBind(unitType("incite"))
    write(ioCell, di, 1)
    a.jumpTo(unit.equal(0))
    a.jumpTo(sensor(unit, prop("controlled")).get().notEqual(0))
    unit.controls.flag(-1)
})

const beginOff = -8
const windowSize = 16

const col = 96
const step = 16

const x = variable()

init(() => {
    x.set(8)
})

const ux = x.toAdd(io.offX())
const uy = y.toAdd(io.offY())

unit.controls.move(ux, uy)
ifNot(unit.controls.within(ux, uy, 1).get().equal(0), () => {
    write(ioCell, di, 2)
    end()
})

const sx = ux.toAdd(beginOff)
const bx = variable().set(sx)
const ix = x.toAdd(beginOff)
const ibx = variable().set(ix)
const iex = ix.toAdd(windowSize)
const sy = uy.toAdd(beginOff)
const by = variable().set(sy)
const iy = y.toAdd(beginOff)
const iby = variable().set(iy)
const iey = iy.toAdd(windowSize)

write(ioCell, di, 3)
di.add(1)
write(ioCell, di, ix)
di.add(1)
write(ioCell, di, iy)
di.add(1)
write(ioCell, di, windowSize)
const d1 = di.add(1)
const d2 = di.toAdd(1)

whileLoop(iy.lessThanEq(iey), () => {
    write(ioCell, d2, iy)
    whileLoop(ix.lessThan(iex), () => {
        write(ioCell, d1, ix)
        const {type, building, floor} = unit.controls.getBlock(sx, sy).packed()
        ifThen(type.notEqual(null), () => {
            const config = sensor(building, prop("config")).get()
            const rotation = sensor(building, prop("rotation")).get().mod(4).floor()
            const size = sensor(building, prop("size")).get()
            ifThen(type.equal(block("air")), () => type.set(1023), () =>
                ifThen(type.equal(block("solid")), () => type.set(1022), () => sensor(type, prop("id")).to(type)))
            const j = [];
            [block("tar"), block("pooled-cryofluid"), block("molten-slag"), block("arkycite-floor"), block("shallow-water"), block("deep-water"),
            block("sand-floor"), block("darksand"), block("core-zone"), block("space")].forEach((fl, index) => {
                const a = jumpToAfter(floor.notEqual(fl))
                floor.set(index)
                j.push(jumpToAfter(always))
                a.here()
            })
            floor.set(15)
            j.forEach(j => j.here())
            ifThen(config.equal(null), () => config.set(1023), () => sensor(config, prop("id")).to(config))
            type.shl(4).or(size).shl(4).or(floor).shl(10).or(config).shl(2).or(rotation)
            const i = iy.toMul(col).add(ix)
            ifThen(size.equal(1), () => {
                crossBankWrite(i, type)
            }, () => {
                crossBankWrite(i, 0b1111111111_1111111111_1111111111_00)
                const x = sensor(building, prop("x")).get().sub(bx).add(ibx).floor()
                const y = sensor(building, prop("y")).get().sub(by).add(iby).floor()
                const j = y.mul(col).add(x)
                crossBankWrite(j, type)
            })
        })
        ix.add(1)
        sx.add(1)
    })
    operation("add", ux, beginOff).to(sx)
    operation("add", x, beginOff).to(ix)
    iy.add(1)
    sy.add(1)
})

x.add(step).mod(col)