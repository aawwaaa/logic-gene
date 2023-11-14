import { doWhileLoop, forLoop, ifNot, ifThen, switchCounterJump, waitState, waitStateNe, whileLoop } from "../generator/condition";
import { Value, Var, always, build, control, end, getlink, item, jumpToAfter, operation, print, printflush, read, variable, wait, write } from "../generator/core";
import { generateIO } from "../generator/private/io";
import { StreamIO } from "../generator/private/stream";

const ioBank = build("bank1")
const headBank = build("bank2")
const status = control(build("sorter1"))

const headSize = 16

const metaSize = 16
const fstabSize = 1024 - headSize

const chunkHeadSize = 4
const chunkSize = 64

const bankBegin = 3

const rets = {
    success: 0,
    notFound: 1,
    fstabFull: 2,
    chunkFull: 3
}

function readHead(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return read(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"))
}

function writeHead(addr: Var<number>, data: Value<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return write(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"), data)
}

function readFstab(addr: Var<number>){
    return readHead(addr.toAdd(headSize))
}

function writeFstab(addr: Var<number>, data: Value<number>){
    return writeHead(addr.toAdd(headSize), data)
}

function readData(addr: Var<number>){
    return readHead(addr.toAdd(headSize+fstabSize))
}

function writeData(addr: Var<number>, data: Value<number>){
    return writeHead(addr.toAdd(headSize+fstabSize), data)
}

function databankExists(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return getlink(bank).get("bank")
}

const head = generateIO(headBank, {
    files: 0,
    filesCap: 1,
    total: 2,
    free: 3,
    freeBegin: 4
})

const ioChunkSize = 64
const ioChunkBegin = 32

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
    begin: ioChunkBegin
})

function updateStatus(){
    const files = head.files()
    const filesCap = head.filesCap()
    const free = head.free()
    const total = head.total()
    io.files(files)
    io.filesCap(filesCap)
    io.free(free)
    io.total(total)
    print("files: "+files+" / "+filesCap+"\nfreeChunks: "+free+" / "+total)
    printflush(build("message1"))
}

switchCounterJump(io.op(), [() => {
    status.config(item("silicon"))
    end()
}, () => {
    // create
    const ptr = variable("ptr").set(0)
    status.config(item("surge-alloy"))
    doWhileLoop(always, (br) => {
        ifNot(ptr.lessThan(fstabSize / metaSize), () => {
            waitStateNe(ioBank, stream.next, 0)
            io.ret(rets.fstabFull)
            io.op(0)
            io.next(0)
            end()
        })
        ifThen(readFstab(ptr.toMul(metaSize)).get().equal(0), () => {
            br()
        })
        ptr.add(1)
    })
    status.config(item("oxide"))
    io.fileId(ptr)
    waitStateNe(stream.cell, stream.next, 0)
    const fstab = ptr.toMul(metaSize, "fstab")
    writeFstab(fstab, 1)

    fstab.add(1)
    const begin = head.freeBegin()
    ptr.set(begin)
    writeFstab(fstab, ptr)

    fstab.add(1)
    const len = io.len()
    writeFstab(fstab, len)

    fstab.add(2)
    forLoop(() => variable("i").set(0), i => i.lessThan(len), i => i.add(1), i => {
        const data = read(ioBank, i.toAdd(ioChunkBegin)).get("data")
        writeFstab(fstab, data)
        fstab.add(1)
    })

    status.config(item("phase-fabric"))
    io.next(0)
    const dataPtr = ptr.toAdd(chunkHeadSize, "dataPtr")
    const i = variable("i").set(0)
    const count = variable("count").set(1)
    const ret = variable("ret").set(rets.success)
    io.close(0)
    stream.read((len, close, br) => {
        ifThen(ptr.equal(-1), () => {
            close.set(true)
            ret.set(rets.chunkFull)
            br()
        })
        status.config(item("spore-pod"))
        forLoop(() => variable("j").set(0), i => i.lessThan(len), i => i.add(1), (j, br) => {
            const data = read(ioBank, j.toAdd(ioChunkBegin)).get("data")
            writeData(dataPtr.toAdd(i), data)
            i.add(1)
            ifThen(i.greaterThanEq(chunkSize - chunkHeadSize), () => {
                writeData(ptr.toAdd(1), chunkSize - chunkHeadSize)
                i.set(0)
                const next = readData(ptr).get("next")
                ifThen(next.equal(-1), () => {
                    close.set(true)
                    ret.set(rets.chunkFull)
                    br()
                })
                ptr.set(next)
                operation("add", ptr, chunkHeadSize).to(dataPtr)
                count.add(1)
            })
        })
        status.config(item("scrap"))
    })
    const next = variable().set("next")
    readData(ptr).to(next)
    writeData(ptr, -1)
    writeData(ptr.toAdd(1), i)
    head.freeBegin(next)
    head.files(head.files().add(1))
    head.free(head.free().sub(count))
    updateStatus()
    io.ret(ret)
}, () => {
    // read
    const fileId = io.fileId()
    const fstab = fileId.toMul(metaSize, "fstab")
    ifThen(readFstab(fstab).get().notEqual(0), () => {
        fstab.add(1)
        const ptr = readFstab(fstab).get("ptr")
        const begin = ptr.toAdd(chunkHeadSize, "begin")
        stream.write((len, close) => {
            status.config(item("plastanium"))
            readData(ptr.toAdd(1)).to(len)
            forLoop(() => variable("i").set(0), i => i.lessThan(len), i => i.add(1), (i, br) => {
                const data = readData(i.toAdd(begin)).get("data")
                write(ioBank, i.toAdd(ioChunkBegin), data)
            })
            readData(ptr).to(ptr)
            operation("add", ptr, chunkHeadSize).to(begin)
            ifThen(ptr.equal(-1), () => {
                close.set(true)
            })
            status.config(item("scrap"))
        })
        io.ret(rets.success)
    }, () => {
        io.len(0)
        io.close(1)
        io.next(1)
        waitState(ioBank, stream.next, 0)
        io.close(0)
        io.ret(rets.notFound)
    })
}, () => {
    // rewrite
    const fileId = io.fileId()
    const fstab = fileId.toMul(metaSize, "fstab")
    ifThen(readFstab(fstab).get().notEqual(0), () => {
        status.config(item("beryllium"))
        const ptr = readFstab(fstab.toAdd(1)).get("ptr")
        const begin = variable("begin").set(ptr)
        const next = readData(ptr).get("next")
        const count = variable("count").set(1)
        whileLoop(next.notEqual(-1), () => {
            ptr.set(next)
            count.add(1)
            readData(ptr).to(next)
        })
        writeData(ptr, head.freeBegin())
        head.files(head.files().sub(1))
        head.free(head.free().add(count))
        head.freeBegin(begin)
    }, () => {
        const ptr = variable("ptr").set(0)
        status.config(item("surge-alloy"))
        doWhileLoop(always, (br) => {
            ifNot(ptr.lessThan(fstabSize / metaSize), () => {
                waitStateNe(ioBank, stream.next, 0)
                io.close(1)
                io.next(0)
                io.ret(rets.fstabFull)
                io.op(0)
                end()
            })
            ifThen(readFstab(ptr.toMul(metaSize)).get().equal(0), () => {
                br()
            })
            ptr.add(1)
        })
        io.fileId(ptr)
        waitStateNe(stream.cell, stream.next, 0)
        const fstab = ptr.toMul(metaSize, "fstab")
        writeFstab(fstab, 1)
        fstab.add(1)
        writeFstab(fstab.toAdd(2), 0)
    })
    const ptr = head.freeBegin()
    writeFstab(fstab.toAdd(1), ptr)
    const dataPtr = ptr.toAdd(chunkHeadSize, "dataPtr")
    const i = variable("i").set(0)
    const count = variable("count").set(1)
    const ret = variable("ret").set(rets.success)
    io.close(0)
    stream.read((len, close, br) => {
        ifThen(ptr.equal(-1), () => {
            close.set(true)
            ret.set(rets.chunkFull)
            br()
        })
        status.config(item("spore-pod"))
        forLoop(() => variable("j").set(0), i => i.lessThan(len), i => i.add(1), (j, br) => {
            const data = read(ioBank, j.toAdd(ioChunkBegin)).get("data")
            writeData(dataPtr.toAdd(i), data)
            i.add(1)
            ifThen(i.greaterThanEq(chunkSize - chunkHeadSize), () => {
                writeData(ptr.toAdd(1), chunkSize - chunkHeadSize)
                i.set(0)
                const next = readData(ptr).get("next")
                ifThen(next.equal(-1), () => {
                    close.set(true)
                    ret.set(rets.chunkFull)
                    br()
                })
                ptr.set(next)
                operation("add", ptr, chunkHeadSize).to(dataPtr)
                count.add(1)
            })
        })
        status.config(item("scrap"))
    })
    const next = variable().set("next")
    readData(ptr).to(next)
    writeData(ptr, -1)
    writeData(ptr.toAdd(1), i)
    head.freeBegin(next)
    head.files(head.files().add(1))
    head.free(head.free().sub(count))
    updateStatus()
    io.ret(ret)
}, () => {
    // delete
    const fileId = io.fileId()
    const fstab = fileId.toMul(metaSize, "fstab")
    ifThen(readFstab(fstab).get().notEqual(0), () => {
        status.config(item("pyratite"))
        writeFstab(fstab, 0)
        const ptr = readFstab(fstab.add(1)).get("ptr")
        const begin = variable("begin").set(ptr)
        const next = readData(ptr).get("next")
        const count = variable("count").set(1)
        whileLoop(next.notEqual(-1), () => {
            ptr.set(next)
            count.add(1)
            readData(ptr).to(next)
        })
        writeData(ptr, head.freeBegin())
        head.freeBegin(begin)
        head.free(head.free().add(count))
        head.files(head.files().sub(1))
        updateStatus()
        io.ret(rets.success)
    }, () => {
        io.ret(rets.notFound)
    })
}, () => {
    // status
    updateStatus()
    io.ret(rets.success)
}, () => {
    // format
    status.config(item("blast-compound"))
    head.files(0)
    head.filesCap(0)
    head.free(0)
    head.total(0)
    head.freeBegin(0)
    const count = variable("count").set(0)
    const ptr = variable("ptr").set(0)
    whileLoop(() => databankExists(ptr.toAdd(headSize+fstabSize)).notEqual(0), () => {
        writeData(ptr, ptr.toAdd(chunkSize))
        ptr.add(chunkSize)
        count.add(1)
    })
    writeData(ptr, -1)
    forLoop(() => variable("i").set(0), i => i.lessThan(fstabSize), i => i.add(metaSize), i => {
        writeFstab(i, 0)
    })
    head.filesCap(fstabSize / metaSize)
    head.free(count)
    head.total(count)
    updateStatus()
    io.ret(count)
}, () => {
    // list
    const ptr = variable("ptr").set(0)
    const count = variable("count")
    stream.write((len, close, breaking) => {
        status.config(item("titanium"))
        count.set(0)
        whileLoop(() => count.lessThan(ioChunkSize - 1), () => {
            doWhileLoop(always, (br) => {
                ifNot(ptr.lessThan(fstabSize / metaSize), () => {
                    close.set(true)
                    len.set(count)
                    breaking()
                })
                ifThen(readFstab(ptr.toMul(metaSize)).get().notEqual(0), () => {
                    br()
                })
                ptr.add(1)
            })
            const begin = ptr.toMul(metaSize, "begin")
            write(ioBank, count.toAdd(ioChunkBegin), ptr)
            count.add(1)
            forLoop(() => variable("i").set(1), i => i.lessThan(metaSize), i => i.add(1), i => {
                const data = readFstab(i.toAdd(begin)).get("data")
                write(ioBank, count.toAdd(ioChunkBegin), data)
                count.add(1)
            })
            ptr.add(1)
        })
        len.set(count)
        status.config(item("scrap"))
    })
    io.ret(head.files())
}, () => {
    // rename
    const fileId = io.fileId()
    const fstab = fileId.toMul(metaSize, "fstab")
    ifThen(readFstab(fstab).get().notEqual(0), () => {
        status.config(item("lead"))
        fstab.add(2)
        waitStateNe(ioBank, io.next.addr, 0)
        const len = io.len()
        writeFstab(fstab, len)

        fstab.add(2)
        forLoop(() => variable("i").set(0), i => i.lessThan(len), i => i.add(1), i => {
            const data = read(ioBank, i.toAdd(ioChunkBegin)).get("data")
            writeFstab(fstab, data)
            fstab.add(1)
        })
        io.next(0)
        io.ret(rets.success)
    }, () => {
        waitStateNe(ioBank, io.next.addr, 0)
        io.next(0)
        io.ret(rets.notFound)
    })
}])
io.op(0)
