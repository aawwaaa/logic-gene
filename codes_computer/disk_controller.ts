import { switchCounterJump, doWhileLoop, ifNot, waitStateNe, ifThen, forLoop, waitState, whileLoop } from "../generator/condition"
import { Value, Var, always, build, control, end, getlink, item, operation, print, printflush, read, variable, write } from "../generator/core"
import { generateIO } from "../generator/private/io"
import { StreamIO } from "../generator/private/stream"

const ioBank = build("bank1")
const diskBank = build("bank2")
const halt = control(build("switch1"))

const bankBegin = 3

const offset = 256 - 12
const ioChunkSize = 64

const io = generateIO(ioBank, {
    op: offset,
    fileId: offset + 1,
    ret: offset + 2,
    dataLen: offset + 3,
    dataAddr: offset + 4,
    nameLen: offset + 5,
    nameAddr: offset + 6,
    files: offset + 7,
    filesCap: offset + 8,
    free: offset + 9,
    total: offset + 10,
    halt: offset + 11
})
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

function crossBankRead(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return read(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"))
}

function crossBankWrite(addr: Var<number>, data: Value<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return write(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"), data)
}

switchCounterJump(io.op(), [() => {
    end()
}, () => {
    // create
    disk.op(1)
    const nameLen = io.nameLen()
    const nameBegin = io.nameAddr()
    forLoop(() => variable().set(0), i => i.lessThan(nameLen), i => i.add(1), i => {
        const data = crossBankRead(i.toAdd(nameBegin)).get("data")
        write(ioBank, i.toAdd(stream.begin), data)
    })
    disk.next(1)
    waitState(diskBank, disk.next.addr, 0)
    const op = disk.op()
    ifThen(op.equal(0), () => {
        io.ret(disk.ret())
        io.op(0)
        ifNot(io.halt().equal(0), () => {
            halt.enabled(false)
        })
        end()
    })
    const ptr = io.dataAddr()
    const dataLen = io.dataLen()
    const i = variable().set(0)
    const j = variable().set(0)
    stream.write((len, close, br) => {
        whileLoop(i.lessThan(ioChunkSize), () => {
            ifThen(j.greaterThanEq(dataLen), () => {
                len.set(i)
                close.set(true)
                br()
            })
            const data = crossBankRead(ptr.toAdd(j)).get("data")
            write(ioBank, i.toAdd(stream.begin), data)
            i.add(1)
            j.add(1)
        })
        len.set(ioChunkSize)
    })
    io.ret(disk.ret())
}, () => {
    // read
    disk.fileId(io.fileId())
    disk.op(2)
    const i = io.dataAddr()
    const l = variable().set(0)
    stream.read((len, close) => {
        forLoop(() => variable().set(0), j => j.lessThan(len), j => j.add(1), j => {
            const data = read(diskBank, j.toAdd(stream.begin)).get("data")
            crossBankWrite(i, data)
            i.add(1)
        })
        l.add(len)
    })
    io.dataLen(l)
    io.ret(disk.ret())
}, () => {
    // rewrite
    disk.fileId(io.fileId())
    disk.op(3)
    const ptr = io.dataAddr()
    const dataLen = io.dataLen()
    const i = variable().set(0)
    const j = variable().set(0)
    stream.write((len, close, br) => {
        whileLoop(i.lessThan(ioChunkSize), () => {
            ifThen(j.greaterThanEq(dataLen), () => {
                len.set(i)
                close.set(true)
                br()
            })
            const data = crossBankRead(ptr.toAdd(j)).get("data")
            write(ioBank, i.toAdd(stream.begin), data)
            i.add(1)
            j.add(1)
        })
        len.set(ioChunkSize)
    })
    io.ret(disk.ret())
}, () => {
    // delete
    disk.fileId(io.fileId())
    disk.op(4)
    waitState(diskBank, disk.op.addr, 0)
    io.ret(disk.ret())
}, () => {
    // status
    disk.op(5)
    waitState(diskBank, disk.op.addr, 0)
    io.files(disk.files())
    io.filesCap(disk.filesCap())
    io.free(disk.free())
    io.total(disk.total())
    io.ret(disk.ret())
}, () => {
    // format
    disk.op(6)
    waitState(diskBank, disk.op.addr, 0)
    io.files(disk.files())
    io.filesCap(disk.filesCap())
    io.free(disk.free())
    io.total(disk.total())
    io.ret(disk.ret())
}, () => {
    // list
    disk.op(7)
    const i = io.dataAddr()
    const l = variable().set(0)
    stream.read((len, close) => {
        forLoop(() => variable().set(0), j => j.lessThan(len), j => j.add(1), j => {
            const data = read(diskBank, j.toAdd(stream.begin)).get("data")
            crossBankWrite(i, data)
            i.add(1)
        })
        l.add(len)
    })
    io.dataLen(l)
    io.ret(disk.ret())
}, () => {
    // rename
    disk.fileId(io.fileId())
    const nameLen = io.nameLen()
    const nameBegin = io.nameAddr()
    forLoop(() => variable().set(0), i => i.lessThan(nameLen), i => i.add(1), i => {
        const data = crossBankRead(i.toAdd(nameBegin)).get("data")
        write(ioBank, i.toAdd(stream.begin), data)
    })
    disk.len(nameLen)
    disk.op(8)
    disk.next(1)
    waitState(diskBank, disk.next.addr, 0)
    waitState(diskBank, disk.op.addr, 0)
    io.ret(disk.ret())
}])
io.op(0)
ifNot(io.halt().equal(0), () => {
    halt.enabled(false)
})
