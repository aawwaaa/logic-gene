import { doWhileLoop, forLoop, ifThen, waitState } from "../generator/condition";
import { build, control, print, printflush, prop, read, sensor, variable } from "../generator/core";
import { printString, stringConstant } from "../generator/data";
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

io.next(0)
io.close(0)

io.op(7)

stream.read((len, close) => {
    forLoop(() => variable("i").set(0), i => i.lessThan(len), i => i.add(16), i => {
        const id = read(stream.cell, i.toAdd(stream.begin)).get("id")
        print("["+id+"]: ")
        // forLoop(() => variable("j").set(0), i => i.lessThan(16), i => i.add(1), j => {
        //     const data = read(stream.cell, j.toAdd(i).toAdd(stream.begin))
        //     print(data+" ")
        // })
        // print("\n")
        printString(stream.cell, i.toAdd(stream.begin + 2), i.toAdd(stream.begin + 4))
        print("\n")
    })
})

waitState(stream.cell, 0, 0)

const ret = io.ret()
print("files: "+ret)
printflush(build("message1"))

control(sw).enabled(0)