import { doWhileLoop, forLoop, ifThen, waitState } from "../generator/condition";
import { build, control, print, printflush, prop, read, sensor, variable } from "../generator/core";
import { printString, stringConstant } from "../generator/data";
import { generateIO } from "../generator/private/io";
import { StreamIO } from "../generator/private/stream";

const sw = build("switch1")
const ioBank = build("bank1")

const file = variable("file").set(0)

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

doWhileLoop(() => sensor(sw, prop("enabled")).get().equal(0), () => {})

io.fileId(file)
io.op(4)

waitState(ioBank, 0, 0)

const ret = io.ret()
print("ret: "+ret)
printflush(build("message1"))

control(sw).enabled(0)