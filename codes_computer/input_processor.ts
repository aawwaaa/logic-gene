import { doWhileLoop, ifThen, switchCounterJump, waitState, whileLoop } from "../generator/condition"
import { build, jumpToAfter, read, variable, write } from "../generator/core"
import { data } from "../generator/data"
import { generateIO } from "../generator/private/io"
import { DataIO } from "../generator/private/stream"

const ioCell = build("cell1")
const buffer = build("cell2")
const keyboard = build("cell3")
const port = build("bank1")

const io = generateIO(ioCell, {
    charIn: 56,
    cursor: 57,
    echo: 58,
    noBuffer: 59,
    bufferPtr: 60,
    cursorVar: 63,

    pullBuffer: 52,
    pullScreen: 53,
    pullScreenBegin: 54,
    pullScreenLen: 55
})

function processKeyboard(){
    const mode = read(keyboard, 7).get()
    const mark = jumpToAfter(mode.equal(0))
    const c1 = read(keyboard, 0).get()
    const c2 = read(keyboard, 1).get()
    switchCounterJump(mode, [() => {}, () => {
        ifThen(io.noBuffer().notEqual(0), () => {
            waitState(port, 0, 0)
            write(port, 2, c1)
            write(port, 1, 1)
            write(port, 0, 1)
        }, () => {
            const ptr = io.bufferPtr()
            write(buffer, ptr, c1)
            io.bufferPtr(ptr.add(1))
        })
        ifThen(io.echo().notEqual(0), () => {
            io.charIn(c1)
            waitState(ioCell, io.charIn.addr, -1)
        })
    }, () => {
        waitState(port, 0, 0)
        write(port, 2, c1)
        write(port, 3, c2)
        ifThen(c1.equal(0x1b), () => {
            write(port, 1, 2)
        }, () => {
            write(port, 1, 1)
        })
        write(port, 0, 1)
    }, () => {
        waitState(port, 0, 0)
        ifThen(io.noBuffer().notEqual(0), () => {
            write(port, 2, c1)
            write(port, 1, 1)
            write(port, 0, 1)
        }, () => {
            data.copy(buffer, 0, port, 3, io.bufferPtr())
            write(port, 2, c1)
            write(port, 1, io.bufferPtr().add(1))
            write(port, 0, 1)
        })
    }, () => {
        waitState(port, 0, 0)
        ifThen(io.noBuffer().notEqual(0), () => {
            write(port, 2, c1)
            write(port, 1, 1)
            write(port, 0, 1)
        }, () => {
            data.copy(buffer, 0, port, 3, io.bufferPtr())
            write(port, 2, c1)
            write(port, 1, io.bufferPtr().add(1))
            write(port, 0, 1)
        })
        ifThen(io.echo().notEqual(0), () => {
            io.charIn(c1)
            waitState(ioCell, io.charIn.addr, -1)
        })
        io.bufferPtr(0)
    }, () => {
        io.charIn(0x15)
        waitState(ioCell, io.charIn.addr, -1)
        io.charIn(0x00)
        waitState(ioCell, io.charIn.addr, -1)
        io.charIn(0x10)
        waitState(ioCell, io.charIn.addr, -1)
        io.charIn(0x00)
        waitState(ioCell, io.charIn.addr, -1)
        write(port, 2, 0x10)
        write(port, 1, 1)
        write(port, 0, 1)
    }])
    write(keyboard, 7, 0)
    mark.here()
}

const i = variable()
doWhileLoop(i.notEqual(true), ()=>{
    processKeyboard()
    read(port, 256).to(i)
})

const len = read(port, 257).get()
i.set(0)
whileLoop(i.lessThan(len), () => {
    const value = read(port, i.toAdd(258)).get()
    io.charIn(value)
    waitState(ioCell, io.charIn.addr, -1)
    i.add(1)
})

write(port, 256, 0)