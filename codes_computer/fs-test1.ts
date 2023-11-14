import { doWhileLoop, forLoop, ifThen, waitState } from "../generator/condition";
import { build, control, print, printflush, prop, sensor, variable, write } from "../generator/core";
import { stringConstant } from "../generator/data";
import { generateIO } from "../generator/private/io";
import { StreamIO } from "../generator/private/stream";

const sw = build("switch1")
const ioBank = build("bank1")

const io = generateIO(ioBank, {
    op: 0,
    fileId: 1,
    ret: 2,

    files: 4,
    filesCap: 5,
    free: 6,
    total: 7,

    close: 8,
    next: 9,
    len: 10
})

const stream = new StreamIO({
    cell: ioBank,
    close: 8,
    next: 9,
    len: 10,
    begin: 32
})

doWhileLoop(() => sensor(sw, prop("enabled")).get().equal(0), () => {})

io.op(1)

stringConstant(ioBank, 32, "TEST")
io.len(4)

io.next(1)
waitState(stream.cell, stream.next, 0)

const i = variable().set(6)

stream.write((len, close) => {
    const j = i.toMul(0x10)
    forLoop(() => variable().set(0), i => i.lessThan(32), i=>i.add(1), v => {
        ifThen(v.toMod(2).equal(1), () => {
            write(ioBank, v.toAdd(32), v.toAdd(j).mod(0x60).add(0x20))
        }, () => {
            write(ioBank, v.toAdd(32), i.toAdd(0x30))
        })
    })
    len.set(32)
    ifThen(i.sub(1).equal(0), () => close.set(true))
})

waitState(stream.cell, 0, 0)

const ret = io.ret()
const fileId = io.fileId()
print(ret+"    file: "+fileId)
printflush(build("message1"))

control(sw).enabled(0)