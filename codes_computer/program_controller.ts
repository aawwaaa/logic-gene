import { defineBlock } from "../generator/block";
import { doWhileLoop, forLoop, ifThen, switchCounterJump, switchSplit, waitState, waitStateNe, whileLoop } from "../generator/condition";
import { Condition, Value, Var, always, build, control, end, getlink, jumpMark, jumpToAfter, operation, print, printflush, prop, read, sensor, time, variable, wait, write } from "../generator/core";
import { data } from "../generator/data";
import { generateIO } from "../generator/private/io";
import { DataIO, StreamIO } from "../generator/private/stream";

const io = build("bank1")
const diskBank = build("bank2")
const constant = build("bank3")
const componentBank = build("bank4")
const bufferBank = build("bank5")
const intCell = build("cell1")
const halt = build("switch1")
const clock = build("switch2")
const registerCell = build("cell2")
const varsCell = build("cell3")

const dataio = new DataIO(io, constant)
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
const diskOffset = 256 - 12
const offset = 256

const diskCont = generateIO(componentBank, {
    op: diskOffset,
    fileId: diskOffset + 1,
    ret: diskOffset + 2,
    dataLen: diskOffset + 3,
    dataAddr: diskOffset + 4,
    nameLen: diskOffset + 5,
    nameAddr: diskOffset + 6,
    files: diskOffset + 7,
    filesCap: diskOffset + 8,
    free: diskOffset + 9,
    total: diskOffset + 10,
    halt: diskOffset + 11
})
const int = generateIO(intCell, {
    type: 0,
    args: 2,
    ret: 3
})
const vars = generateIO(varsCell, {
    enable: 0,
    result: 4,
    fid: 5,
    name: 1,
    cbegin: 2,
    clen: 3,

    inUtil: 16,
    initUtil: 17
})

const cons = {
    loading: dataio.defineConstant(dataio => {
        dataio.clearScreen(" ")
        dataio.cursor(7, 3)
        dataio.ustring("loading...")
    }),
    page: dataio.defineConstant(dataio => {
        dataio.clearScreen("\x00")
        dataio.ustring("page ")
    }),
    utils: dataio.defineConstant(dataio => {
        dataio.ustring("utils")
    }),
    fileName: dataio.defineConstant(dataio => {
        dataio.clearScreen("\x00")
    }),
    filePage: dataio.defineConstant(dataio => {
        dataio.cursor(3, 1)
        dataio.ustring("open")
        dataio.cursor(4, 1)
        dataio.ustring("rename")
        dataio.cursor(5, 1)
        dataio.ustring("delete")
    }),
    back: dataio.defineConstant(dataio => {
        dataio.cursor(2, 1)
        dataio.ustring("back")
    }),
    confirm: dataio.defineConstant(dataio => {
        dataio.clearScreen("\x00")
        dataio.ustring("confirm")
        dataio.cursor(2, 1)
        dataio.ustring("no")
        dataio.cursor(3, 1)
        dataio.ustring("yes")
        dataio.ustring("\n\n")
    }),
    confirmDelete: dataio.defineConstant(dataio => {
        dataio.ustring("do you really want to delete this file?")
    }),
    exited: dataio.defineConstant(dataio => {
        dataio.displayCursor(0)
        dataio.ustring("program exited.")
    }),
    breaked: dataio.defineConstant(dataio => {
        dataio.displayCursor(0)
        dataio.ustring("breaked.")
    }),
    continue: dataio.defineConstant(dataio => {
        dataio.ustring("\npress enter to continue.")
    }),
    importSize: dataio.defineConstant(dataio => {
        dataio.ustring("\nsize: ")
    }),
    rename: dataio.defineConstant(dataio => {
        dataio.cursor(13, 0)
        dataio.displayCursor(1)
        dataio.ustring("enter new name:\n")
    })
}
dataio.generateConstant("program_controller")

const currentSelect = variable()
const page = variable()

const state = variable()
const target = variable()
const targetId = variable()

const max = variable()
const maxPage = variable()

let mark: { jumpTo(condition: Condition): void; };
dataio.init(()=>{
    currentSelect.set(-1)
    page.set(0)
    state.set(0)

    mark = jumpMark()
    dataio.displayCursor(0)
    dataio.useConstant(cons.loading)
    dataio.flush()

    dataio.useConstant(cons.page)
    dataio.number(page.toAdd(0x31))
    dataio.ustring("\n")
    dataio.cursor(2, 1)
    dataio.useConstant(cons.utils)

    const currentIndex = variable().set(0)
    maxPage.set(0)
    max.set(0)
    disk.op(7)
    stream.read((len, close, br) => {
        currentIndex.add(1)
        ifThen(currentIndex.greaterThan(3), () => {
            maxPage.add(1)
        })
        ifThen(maxPage.notEqual(page), () => {
            br()
        })
        forLoop(() => variable().set(0), v => v.lessThan(len), v => v.add(16), i => {
            const len = read(diskBank, i.toAdd(2 + stream.begin)).get("len")
            dataio.cursor(max.toAdd(3), 1)
            dataio.data(diskBank, i.toAdd(4 + stream.begin), len)
            data.copy(diskBank, i.toAdd(stream.begin), bufferBank, max.toMul(16), 16)
            max.add(1)
        })
    })
    dataio.cursor(currentSelect.toAdd(3), 0)
    dataio.ustring(">")
    dataio.cursor(15, 0)
    dataio.flush()
})


ifThen(state.equal(-2), () => {
    // running
    const [c1, c2, cbegin, clen] = dataio.readNoInit(() => {
        const h = sensor(halt, prop("enabled")).get()
        const a = diskCont.halt()
        ifThen(h.notEqual(0), () => {
            ifThen(a.equal(0), () => {
                dataio.useConstant(cons.exited)
                dataio.useConstant(cons.continue)
                dataio.flush()
                state.set(5)
                control(clock).enabled(false)
                end()
            })
        })
    })
    ifThen(c1.equal(0x10), () => {
        dataio.useConstant(cons.breaked)
        dataio.useConstant(cons.continue)
        dataio.flush()
        state.set(5)
        control(clock).enabled(false)
        control(halt).enabled(true)
        end()
    })
    waitState(intCell, int.type.addr, 0)
    forLoop(() => variable().set(0), i => i.lessThan(clen), i => i.add(1), i => {
        const data = read(dataio.target, i.toAdd(cbegin)).get()
        write(componentBank, i.toAdd(offset), data)
    })
    write(intCell, int.args.addr + 1, c1)
    write(intCell, int.args.addr + 2, c2)
    write(intCell, int.args.addr + 3, clen)
    int.args(3)
    int.type(0x100)
    end()
})

waitState(varsCell, vars.inUtil.addr, 0)

const [c1, c2, cbegin, clen] = dataio.read()

let program

ifThen(c1.equal(0x0a), ()=>{
    switchCounterJump(state, [() => {
        ifThen(currentSelect.equal(-1), () => {
            currentSelect.set(-1)
            vars.initUtil(1)
            vars.inUtil(1)
            write(io, 258, 0x10)
            write(io, 257, 1)
            write(io, 256, 1)
            waitState(varsCell, vars.inUtil.addr, 0)
            end()
        }, () => {
            target.set(currentSelect)
            const mul = target.toMul(16)
            read(bufferBank, mul).to(targetId)
            currentSelect.set(-1)
            program = jumpMark()
            state.set(2)
            max.set(3)
            dataio.useConstant(cons.fileName)
            const len = read(bufferBank, mul.toAdd(2)).get()
            dataio.data(bufferBank, mul.toAdd(4), len)
            dataio.useConstant(cons.back)
            dataio.useConstant(cons.filePage)
        })
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.ustring(">")
        dataio.flush()
    }, () => {}, () => {
        ifThen(currentSelect.equal(-1), () => {
            state.set(0)
            currentSelect.set(target)
            mark.jumpTo(always)
        })
        ifThen(currentSelect.equal(0), () => {
            state.set(-1)
            dataio.useConstant(cons.loading)
            dataio.flush()
            control(clock).enabled(false)
            const c = control(halt)
            control(clock).enabled(1)
            const t = time.toAdd(400)
            const j = jumpMark()
            c.enabled(true)
            write(registerCell, 0, 512)
            write(registerCell, 1, 64)
            wait(0.02)
            c.enabled(false)
            j.jumpTo(time.lessThan(t))
            control(clock).enabled(0)
            diskCont.halt(0)
            diskCont.dataAddr(512)
            diskCont.fileId(targetId)
            diskCont.op(2)
            waitState(componentBank, diskCont.op.addr, 0)
            dataio.resetProps()
            dataio.flush()
            write(registerCell, 0, 512)
            write(registerCell, 1, 64)
            control(clock).enabled(true)
            const t1 = time.toAdd(200)
            const j1 = jumpMark()
            c.enabled(false)
            j1.jumpTo(time.lessThan(t1))
            state.set(-2)
            end()
        })
        ifThen(currentSelect.equal(1), () => {
            state.set(6)
            dataio.useConstant(cons.rename)
            dataio.flush()
        })
        ifThen(currentSelect.equal(2), () => {
            currentSelect.set(-1)
            state.set(4)
            max.set(1)
            dataio.useConstant(cons.confirm)
            dataio.useConstant(cons.confirmDelete)
        })
        ifThen(currentSelect.notEqual(1), () => {
            dataio.cursor(currentSelect.toAdd(3), 0)
            dataio.ustring(">")
            dataio.flush()
        })
    }, () => {}, () => {
        ifThen(currentSelect.equal(-1), () => {
            state.set(2)
            currentSelect.set(2)
            program.jumpTo(always)
        })
        ifThen(currentSelect.equal(0), () => {
            disk.fileId(targetId)
            disk.op(4)
            dataio.useConstant(cons.loading)
            waitState(diskBank, disk.op.addr, 0)
            currentSelect.set(-1)
            target.set(0)
            state.set(0)
            mark.jumpTo(always)
        })
    }, () => {
        dataio.resetProps()
        dataio.displayCursor(0)
        dataio.flush()
        state.set(2)
        currentSelect.set(0)
        program.jumpTo(always)
    }, () => {
        // rename 6
        dataio.displayCursor(0)
        dataio.useConstant(cons.loading)
        dataio.flush()
        disk.fileId(targetId)
        disk.op(8)
        disk.len(clen)
        forLoop(() => variable().set(0), i => i.lessThan(clen), i => i.add(1), i => {
            const data = read(io, i.toAdd(cbegin)).get("data")
            write(diskBank, i.toAdd(stream.begin), data)
        })
        disk.next(1)
        waitState(diskBank, disk.next.addr, 0)
        state.set(2)
        currentSelect.set(1)
        program.jumpTo(always)
    }])
})

ifThen(c1.equal(0x1b), () => {
    ifThen(c2.equal(15), () => {
        ifThen(state.equal(0), () => {
            page.sub(1)
            ifThen(page.lessThan(0), () => {
                currentSelect.set(maxPage)
            })
            mark.jumpTo(always)
        })
    })
    ifThen(c2.equal(16), () => {
        ifThen(state.equal(0), () => {
            page.add(1)
            ifThen(page.greaterThan(maxPage), () => {
                currentSelect.set(0)
            })
            mark.jumpTo(always)
        })
    })
    ifThen(c2.equal(17), () => {
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.ustring(" ")
        currentSelect.sub(1)
        ifThen(currentSelect.lessThan(-1), () => {
            currentSelect.set(max).sub(1)
        })
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.ustring(">")
        dataio.flush()
    })
    ifThen(c2.equal(18), () => {
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.ustring(" ")
        currentSelect.add(1)
        ifThen(currentSelect.greaterThanEq(max), () => {
            currentSelect.set(-1)
        })
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.ustring(">")
        dataio.flush()
    })
})