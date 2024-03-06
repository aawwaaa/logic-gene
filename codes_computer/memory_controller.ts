import { forLoop, ifThen, switchCounterJump } from "../generator/condition"
import { Value, Var, build, control, end, getlink, print, printflush, read, variable, write } from "../generator/core"
import { generateIO } from "../generator/private/io"

const input = build("bank1")
const componentBank = build("bank2")
const halt = control(build("switch1"))

const bankBegin = 3

function crossBankRead(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return read(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"))
}

function crossBankWrite(addr: Var<number>, data: Value<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return write(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"), data)
}

const diskOffset = 256 - 12
const offset = diskOffset - 6

const diskCont = generateIO(componentBank, {
    halt: diskOffset + 11
})
const io = generateIO(componentBank, {
    enable: offset,
    src: offset + 1,
    fromComponent: offset + 2,
    dst: offset + 3,
    len: offset + 4,
    target: offset + 5
})

ifThen(io.enable().equal(0), end)

const len = io.len()
const src = io.src()
const dst = io.dst()
switchCounterJump(io.fromComponent(), [() => {
    switchCounterJump(io.target(), [() => {
        forLoop(() => variable().set(0), v => v.lessThan(len), v => v.add(1), v => {
            const data = crossBankRead(v.toAdd(src)).get("data")
            crossBankWrite(v.toAdd(dst), data)
        })
    }, () => {
        forLoop(() => variable().set(0), v => v.lessThan(len), v => v.add(1), v => {
            const data = crossBankRead(v.toAdd(src)).get("data")
            write(input, v.toAdd(dst), data)
        })
        write(input, 1, len)
        write(input, 0, 1)
    }, () => {
        forLoop(() => variable().set(0), v => v.lessThan(len), v => v.add(1), v => {
            const data = crossBankRead(v.toAdd(src)).get("data")
            write(componentBank, v.toAdd(dst), data)
        })
    }])
}, () => {
    switchCounterJump(io.target(), [() => {
        forLoop(() => variable().set(0), v => v.lessThan(len), v => v.add(1), v => {
            const data = read(componentBank, v.toAdd(src)).get("data")
            crossBankWrite(v.toAdd(dst), data)
        })
    }, () => {
        forLoop(() => variable().set(0), v => v.lessThan(len), v => v.add(1), v => {
            const data = read(componentBank, v.toAdd(src)).get("data")
            write(input, v.toAdd(dst), data)
        })
        write(input, 1, len)
        write(input, 0, 1)
    }, () => {
        forLoop(() => variable().set(0), v => v.lessThan(len), v => v.add(1), v => {
            const data = read(componentBank, v.toAdd(src)).get("data")
            write(componentBank, v.toAdd(dst), data)
        })
    }])
}])

const ha = diskCont.halt()
ifThen(ha.notEqual(0), () => {
    halt.enabled(false)
})

io.enable(0)