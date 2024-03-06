import { defineBlock } from "../generator/block";
import { doWhileLoop, forLoop, ifNot, ifThen, switchCounterJump, switchSplit, waitState, waitStateNe, whileLoop } from "../generator/condition";
import { Condition, Value, Var, always, build, control, end, getlink, jumpMark, jumpToAfter, operation, print, printflush, prop, read, sensor, time, variable, wait, write } from "../generator/core";
import { generateIO } from "../generator/private/io";
import { DataIO, StreamIO } from "../generator/private/stream";

const io = build("bank1")
const diskBank = build("bank2")
const constant = build("bank3")
const first = build("bank4")
const varsCell = build("cell1")

const version = 1

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
const diskOffset = 512 - 12
const offset = diskOffset - 256

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
    utilsPage: dataio.defineConstant(dataio => {
        dataio.resetProps()
        dataio.displayCursor(0)
        dataio.cursor(0, 0)
        dataio.ustring("utils\n")
        dataio.cursor(2, 1)
        dataio.ustring("back")
        dataio.cursor(3, 1)
        dataio.ustring("import file")
        dataio.cursor(4, 1)
        dataio.ustring("disk status")
        dataio.cursor(5, 1)
        dataio.ustring("system info")
        dataio.cursor(6, 1)
        dataio.ustring("earse disk")
    }),
    fstab: dataio.defineConstant(dataio => {
        dataio.clearScreen("\x00")
        dataio.ustring("disk status")
        dataio.cursor(2, 1)
        dataio.ustring("back")
        dataio.cursor(4, 0)
        dataio.ustring("fstab: ")
    }),
    chunk: dataio.defineConstant(dataio => {
        dataio.ustring("chunk: ")
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
    confirmEarse: dataio.defineConstant(dataio => {
        dataio.ustring("do you really want to earse the disk?\nall files will be deleted.")
    }),
    continue: dataio.defineConstant(dataio => {
        dataio.ustring("\npress enter to continue.")
    }),
    importFile: dataio.defineConstant(dataio => {
        dataio.clearScreen("\x00")
        dataio.ustring("import")
        dataio.cursor(2, 1)
        dataio.ustring("back")
    }),
    importNotFound: dataio.defineConstant(dataio => {
        dataio.cursor(4, 0)
        dataio.ustring("file rom is not detected.")
    }),
    importName: dataio.defineConstant(dataio => {
        dataio.cursor(3, 1)
        dataio.ustring("import")
        dataio.cursor(4, 1)
        dataio.ustring("rename import")
        dataio.cursor(6, 0)
        dataio.ustring("name: \n")
    }),
    versionNotMatched: dataio.defineConstant(dataio => {
        dataio.ustring("\nsupport version\nnot matched: \nsystem: "+version+"\nfile: ")
    }),
    importSize: dataio.defineConstant(dataio => {
        dataio.ustring("\nsize: ")
    }),
    rename: dataio.defineConstant(dataio => {
        dataio.cursor(13, 0)
        dataio.displayCursor(1)
        dataio.ustring("enter new name:\n")
    }),
    fstabFull: dataio.defineConstant(dataio => {
        dataio.ustring("\nfailed: fstab full")
    }),
    chunkFull: dataio.defineConstant(dataio => {
        dataio.ustring("\nfailed: chunk full")
    }),
    success: dataio.defineConstant(dataio => {
        dataio.ustring("\nsuccess")
    }),
    systemInfo: dataio.defineConstant(dataio => {
        dataio.clearScreen("\x00")
        dataio.ustring("system info")
        dataio.cursor(2, 1)
        dataio.ustring("back")
        dataio.cursor(4, 0)
        dataio.ustring("programmable\n")
        dataio.ustring("computer by zzz\n")
        dataio.ustring("version: "+version)
    }),
}
dataio.generateConstant("util_controller")

const currentSelect = variable()
const page = variable()

const state = variable()

const max = variable()
const maxPage = variable()

const num = variable(":num")
const all = variable(":all")
const displayInteger = defineBlock(() => {
    num.add(0.95).log10()
    const len = num.toFloor().max(0)
    whileLoop(len.greaterThanEq(0), () => {
        const chr = operation("pow", 10, num.toSub(len)).get()
        chr.floor().mod(10).add(0x30)
        len.sub(1)
        dataio.number(chr)
    })
})
const displayBar = defineBlock(() => {
    num.div(all).mul(16).floor()
    dataio.ustring("\n")
    forLoop(() => variable().set(0), v => v.lessThan(16), v => v.add(1), v => {
        ifThen(num.lessThanEq(v), () => {
            dataio.ustring("O")
        }, () => {
            dataio.ustring("*")
        })
    })
})

waitStateNe(varsCell, vars.inUtil.addr, 0)

let utils

dataio.init(() => {
    ifThen(vars.initUtil().equal(0), () => {
        write(io, 258, 0x10)
        write(io, 257, 1)
        write(io, 256, 1)
        vars.inUtil(0)
        end()
    })
    vars.initUtil(0)
    currentSelect.set(-1)
    
    utils = jumpMark()
    dataio.clearScreen("\x00")
    dataio.useConstant(cons.utilsPage)

    state.set(0)
    max.set(4)

    dataio.cursor(currentSelect.toAdd(3), 0)
    dataio.ustring(">")
    dataio.flush()
})

const [c1, c2, cbegin, clen] = dataio.read()

const install = defineBlock(() => {
    vars.enable(1)
    dataio.useConstant(cons.loading)
    dataio.flush()
    waitState(varsCell, vars.enable.addr, 0)
    const res = vars.result()
    ifThen(res.equal(0), () => {
        dataio.useConstant(cons.success)
    })
    ifThen(res.equal(2), () => {
        dataio.useConstant(cons.fstabFull)
    })
    ifThen(res.equal(3), () => {
        disk.fileId(vars.fid())
        disk.op(4)
        waitState(diskBank, disk.op.addr, 0)
        dataio.useConstant(cons.chunkFull)
    })
    dataio.useConstant(cons.continue)
    state.set(6)
    dataio.flush()
})

ifThen(c1.equal(0x0a), ()=>{
    switchCounterJump(state, [() => {
        ifThen(currentSelect.equal(-1), () => {
            state.set(0)
            write(io, 258, 0x10)
            write(io, 257, 1)
            write(io, 256, 1)
        })
        ifThen(currentSelect.equal(0), () => {
            state.set(4)
            currentSelect.set(-1)
            dataio.useConstant(cons.importFile)
            const t = read(first, 31).get().add(1000)
            ifThen(time.greaterThan(t), () => {
                max.set(0)
                dataio.useConstant(cons.importNotFound)
            }, () => {
                max.set(2)
                dataio.useConstant(cons.importName)
                const len = read(first, 0).get()
                dataio.data(first, 1, len)
                dataio.useConstant(cons.importSize)
                read(first, 16).to(num)
                num.div(64).ceil()
                displayInteger()
                const minVer = read(first, 17).get("minVer")
                const maxVer = read(first, 18).get("maxVer")
                let mark, mark2;
                ifNot(minVer.lessThanEq(version), () => {
                    mark = jumpMark()
                    dataio.useConstant(cons.versionNotMatched)
                    num.set(minVer)
                    displayInteger()
                    ifNot(maxVer.equal(-1), () => {
                        dataio.char("-")
                        num.set(maxVer)
                        displayInteger()
                    })
                    mark2 = jumpToAfter(always)
                })
                const f = jumpToAfter(maxVer.equal(-1))
                mark.jumpTo(maxVer.lessThan(version))
                f.here()
                mark2.here()
            })
            dataio.flush()
        })
        ifThen(currentSelect.equal(1), () => {
            currentSelect.set(-1)
            state.set(1)
            max.set(0)
            dataio.useConstant(cons.fstab)
            const files = disk.files()
            const filesCap = disk.filesCap()
            const freeChunk = disk.free()
            const totalChunk = disk.total()
            num.set(files)
            displayInteger()
            dataio.ustring("/")
            num.set(filesCap)
            displayInteger()
            num.set(files)
            all.set(filesCap)
            displayBar()
            dataio.ustring("\n")
            dataio.useConstant(cons.chunk)
            const usedChunk = totalChunk.toSub(freeChunk)
            num.set(usedChunk)
            displayInteger()
            dataio.ustring("/")
            num.set(totalChunk)
            displayInteger()
            num.set(usedChunk)
            all.set(totalChunk)
            displayBar()
        })
        ifThen(currentSelect.equal(2), () => {
            currentSelect.set(-1)
            state.set(2)
            max.set(0)
            dataio.useConstant(cons.systemInfo)
        })
        ifThen(currentSelect.equal(3), () => {
            currentSelect.set(-1)
            state.set(3)
            max.set(1)
            dataio.useConstant(cons.confirm)
            dataio.useConstant(cons.confirmEarse)
        })
        dataio.cursor(currentSelect.toAdd(3), 0)
        dataio.ustring(">")
        dataio.flush()
    }, () => {
        ifThen(currentSelect.equal(-1), () => {
            state.set(0)
            currentSelect.set(1)
            utils.jumpTo(always)
        })
    }, () => {
        ifThen(currentSelect.equal(-1), () => {
            state.set(0)
            currentSelect.set(2)
            utils.jumpTo(always)
        })
    }, () => {
        ifThen(currentSelect.equal(-1), () => {
            state.set(1)
            currentSelect.set(3)
            utils.jumpTo(always)
        })
        ifThen(currentSelect.equal(0), () => {
            disk.op(6)
            dataio.useConstant(cons.loading)
            waitState(diskBank, disk.op.addr, 0)
            currentSelect.set(-1)
            state.set(0)
            write(io, 258, 0x10)
            write(io, 257, 1)
            write(io, 256, 1)
            vars.inUtil(0)
        })
    }, () => {
        // install 4
        ifThen(currentSelect.equal(-1), () => {
            state.set(1)
            currentSelect.set(0)
            utils.jumpTo(always)
        })
        ifThen(currentSelect.equal(0), () => {
            vars.name(0)
            install()
        })
        ifThen(currentSelect.equal(1), () => {
            state.set(5)
            dataio.useConstant(cons.rename)
            dataio.flush()
        })
    }, () => {
        // installRename 5
        vars.name(1)
        vars.cbegin(cbegin)
        vars.clen(clen)
        install()
    }, () => {
        // installResult 6
        state.set(0)
        currentSelect.set(-1)
        write(io, 258, 0x10)
        write(io, 257, 1)
        write(io, 256, 1)
        vars.inUtil(0)
    }])
})

ifThen(c1.equal(0x1b), () => {
    ifThen(c2.equal(15), () => {
        ifThen(state.equal(0), () => {
            page.sub(1)
            ifThen(page.lessThan(0), () => {
                currentSelect.set(maxPage)
            })
            utils.jumpTo(always)
        })
    })
    ifThen(c2.equal(16), () => {
        ifThen(state.equal(0), () => {
            page.add(1)
            ifThen(page.greaterThan(maxPage), () => {
                currentSelect.set(0)
            })
            utils.jumpTo(always)
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