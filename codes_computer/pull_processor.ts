import { ifThen, waitState } from "../generator/condition"
import { build, write } from "../generator/core"
import { data } from "../generator/data"
import { generateIO } from "../generator/private/io"

const ioCell = build("cell1")
const buffer = build("cell2")
const port = build("bank1")
const vmem = build("bank2")

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

ifThen(io.pullBuffer().notEqual(0), () => {
    waitState(port, 0, 0)
    data.copy(buffer, 0, port, 3, io.bufferPtr())
    write(port, 2, 0x01)
    write(port, 1, io.bufferPtr().add(1))
    write(port, 0, 1)
    io.pullBuffer(0)
})
ifThen(io.pullScreen().notEqual(0), () => {
    waitState(port, 0, 0)
    data.copy(vmem, io.pullScreenBegin(), port, 3, io.pullScreenLen())
    write(port, 2, 0x01)
    write(port, 1, io.pullScreenLen())
    write(port, 0, 1)
    io.pullScreen(0)
})