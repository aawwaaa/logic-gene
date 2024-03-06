import { doWhileLoop, forLoop, ifThen, switchCounterJump, waitState, waitStateNe, whileLoop } from "../generator/condition";
import { SingleResult, Value, Var, build, end, operation, read, variable, write } from "../generator/core";
import { generateIO } from "../generator/private/io";

const ioCell = build("cell1")
const vmem = build("bank1")
const buffer = build("cell2")

const io = generateIO(ioCell, {
    charIn: 56,
    cursor: 57,
    echo: 58,
    noBuffer: 59,
    bufferPtr: 60,
    cursorDsp: 61,
    cursorVar: 63,

    pullBuffer: 52,
    pullScreen: 53,
    pullScreenBegin: 54,
    pullScreenLen: 55
})

const row = 16
const col = 16

const size = row * col

function readCharIn(): SingleResult<number>{
    write(ioCell, io.charIn.addr, -1)
    waitStateNe(ioCell, io.charIn.addr, -1)
    return read(ioCell, io.charIn.addr)
}

function scrollUp(rows: Value<number>){
    const i = operation("mul", rows, col).get()
    const cursor = io.cursor()
    cursor.sub(i)
    io.cursor(cursor)
    const j = variable().set(0)
    whileLoop(i.lessThan(size), () => {
        const value = read(vmem, i).get()
        write(vmem, j, value)
        i.add(1)
        j.add(1)
    })
    whileLoop(j.lessThan(size), () => {
        write(vmem, j, 0)
        j.add(1)
    })
}

function scrollDown(rows: Var<number>){
    const i = operation("mul", rows, col).get()
    const cursor = io.cursor()
    cursor.add(i)
    io.cursor(cursor)
    operation("sub", size, i).to(i)
    const j = variable().set(size)
    whileLoop(i.greaterThanEq(0), () => {
        const value = read(vmem, i).get()
        write(vmem, j, value)
        i.sub(1)
        j.sub(1)
    })
    whileLoop(j.greaterThanEq(0), () => {
        write(vmem, j, 0)
        j.sub(1)
    })
}

function nextLine(){
    const cursor = io.cursor()
    const row = cursor.toDiv(col).floor()
    ifThen(cursor.toMod(col).equal(0), () => {
        row.add(1)
    })
    row.add(1).mul(col)
    whileLoop(row.greaterThanEq(size), () => {
        scrollUp(1)
        row.sub(col)
    })
    io.cursor(row)
}

const chr = readCharIn().get()
const p2 = variable()
const p3 = variable()

// clear
ifThen(chr.equal(0x10), () => {
    readCharIn().to(p2)
    forLoop(() => variable().set(0), v => v.lessThan(size), v => v.add(1), v => {
        write(vmem, v, p2)
    })
    io.cursor(0)
    end()
})

// cursor
ifThen(chr.equal(0x11), () => {
    readCharIn().to(p2)
    readCharIn().to(p3)
    p2.mul(col).add(p3)
    io.cursor(p2)
    end()
})

// scrollUp
ifThen(chr.equal(0x12), () => {
    readCharIn().to(p2)
    scrollUp(p2)
    end()
})

// scrollDown
ifThen(chr.equal(0x13), () => {
    readCharIn().to(p2)
    scrollDown(p2)
    end()
})

// buffer
ifThen(chr.equal(0x14), () => {
    readCharIn().to(p2)
    switchCounterJump(p2, [() => {
        io.pullBuffer(1)
        waitState(ioCell, io.pullBuffer.addr, 0)
    }, () => {
        io.pullBuffer(1)
        waitState(ioCell, io.pullBuffer.addr, 0)
        io.bufferPtr(0)
    }, () => {
        io.bufferPtr(0)
    }, () => {
        readCharIn().to(p2)
        io.bufferPtr(p2)
        const i = variable().set(0)
        whileLoop(i.lessThan(p2), () => {
            readCharIn().to(p3)
            write(buffer, i, p3)
            i.add(1)
        })
    }, () => {
        readCharIn().to(p2)
        const ptr = io.bufferPtr()
        io.bufferPtr(ptr.toAdd(p2))
        const i = variable().set(0)
        whileLoop(i.lessThan(p2), () => {
            readCharIn().to(p3)
            write(buffer, i.toAdd(ptr), p3)
            i.add(1)
        })
    }])
    end()
})

// props
ifThen(chr.equal(0x15), () => {
    readCharIn().to(p2)
    switchCounterJump(p2, [() => {
        io.echo(1)
        io.noBuffer(0)
        io.cursor(0)
        io.cursorDsp(1)
        io.bufferPtr(0)
        forLoop(() => variable().set(0), v => v.lessThan(size), v => v.add(1), v => {
            write(vmem, v, 0x0)
        })
    }, () => {
        readCharIn().to(p2)
        io.echo(p2)
    }, () => {
        readCharIn().to(p2)
        io.noBuffer(p2)
    }, () => {
        readCharIn().to(p2)
        ifThen(p2.equal(0), () => {
            io.cursorVar(io.cursor())
        }, () => {
            io.cursor(io.cursorVar())
        })
    }, () => {
        readCharIn().to(p2)
        io.cursorDsp(p2)
    }])
    end()
})

// pull-vmem
ifThen(chr.equal(0x16), () => {
    readCharIn().to(p2)
    readCharIn().to(p3)
    p2.mul(col).add(p3)
    readCharIn().to(p3)
    io.pullScreenBegin(p2)
    io.pullScreenLen(p3)
    io.pullScreen(1)
})

// \n(0xa)
ifThen(chr.equal(0xa), () => {
    nextLine()
    end()
})

// \b(0x8)
ifThen(chr.equal(0x8), () => {
    const cursor = io.cursor()
    ifThen(cursor.toMod(col).equal(0), () => {
        const r = cursor.div(col).sub(1).mul(col)
        ifThen(r.lessThan(0), end)
        cursor.set(r.toAdd(col - 1))
        doWhileLoop(chr.equal(0), (br) => {
            cursor.sub(1)
            ifThen(cursor.lessThan(r), br)
            read(vmem, cursor).to(chr)
        })
        cursor.add(1)
        io.cursor(cursor)
    }, () => {
        cursor.sub(1)
        write(vmem, cursor, 0)
        io.cursor(cursor)
    })
    end()
})

ifThen(io.cursor().greaterThanEq(size), () => {
    nextLine()
})

const cursor = io.cursor()
write(vmem, cursor, chr)
cursor.add(1)
io.cursor(cursor)