import { ifThen, waitState, whileLoop } from "../generator/condition"
import { Value, Var, build, end, getlink, read, variable, write } from "../generator/core"
import { data } from "../generator/data"
import { generateIO } from "../generator/private/io"
import { StreamIO } from "../generator/private/stream"

const ioCell = build("cell1")
const input = build("bank1")
const diskBank = build("bank2")
const first = build("bank3")

const bankBegin = 3

const io = generateIO(ioCell, {
    enable: 0,
    result: 4,
    fid: 5,
    name: 1,
    cbegin: 2,
    clen: 3
})

function crossBankRead(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return read(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"))
}

function crossBankWrite(addr: Var<number>, data: Value<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return write(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"), data)
}

ifThen(io.enable().equal(0), end)

const disk = generateIO(diskBank, {
    op: 0,
    fileId: 1,
    ret: 2,

    files: 4,
    filesCap: 5,
    free: 6,
    total: 7,

    close: 8,
    next: 9,
    len: 10,
})
const stream = new StreamIO({
    cell: diskBank,
    close: 8,
    next: 9,
    len: 10,
    begin: 32
})

disk.op(1)
ifThen(io.name().equal(0), () => {
    const len = read(first, 0).get()
    data.copy(first, 1, diskBank, stream.begin, len)
    disk.len(len)
}, () => {
    const len = io.clen()
    data.copy(input, io.cbegin(), diskBank, stream.begin, len)
    disk.len(len)
})
disk.next(1)
waitState(diskBank, disk.next.addr, 0)
ifThen(disk.op().equal(0), () => {
    io.result(disk.ret())
    io.fid(disk.fileId())
    io.enable(0)
    end()
})
const i = variable().set(0)
const l = read(first, 16).get()
stream.write((len, close, br) => {
    const j = variable().set(0)
    whileLoop(i.lessThan(l), () => {
        ifThen(j.greaterThanEq(64), () => {
            len.set(j)
            br()
        })
        const data = crossBankRead(i.toAdd(32)).get()
        write(diskBank, j.toAdd(stream.begin), data)
        i.add(1)
        j.add(1)
    })
    len.set(j)
    close.set(true)
})
waitState(diskBank, disk.op.addr, 0)
io.result(disk.ret())
io.fid(disk.fileId())
io.enable(0)
end()