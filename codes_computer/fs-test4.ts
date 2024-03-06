import { doWhileLoop, ifThen, waitState } from "../generator/condition";
import { build, control, print, printflush, prop, sensor, variable } from "../generator/core";
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

io.fileId(0)
io.op(3)

const i = variable().set(4)

stream.write((len, close) => {
    stringConstant(ioBank, 32, "file data\ntexts changed!\n")
    len.set(25)
    ifThen(i.sub(1).equal(0), () => close.set(true))
})

waitState(stream.cell, 0, 0)

const ret = io.ret()
const fileId = io.fileId()
print(ret+"    file: "+fileId)
printflush(build("message1"))

control(sw).enabled(0)