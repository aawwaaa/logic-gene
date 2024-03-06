import { forLoop, ifThen, switchSplit } from "../generator/condition";
import { build, end, jumpToAfter, read, variable, wait, write } from "../generator/core";

const keyboard = build("cell1")
const io = build("cell2")
const buffer = build("bank1")
const port = build("bank2")

const mode = read(keyboard, 7).get()

const a = read(keyboard, 0).get()
const b = read(keyboard, 1).get()

switchSplit(mode, [end, ()=>{
    write(io, 0, a)
    write(io, 16, a)
}, ()=>{
    write(port, 1, 1)
    write(port, 2, a)
    ifThen(a.equal(0x05), ()=>{
        write(port, 1, 2)
        write(port, 3, b)
    }, ()=>ifThen(a.equal(0x1b), ()=>{
        write(port, 1, 2)
        write(port, 3, b)
    }))
    write(port, 0, 1)
}, ()=>{
    const len = read(io, 17).get()
    const off = variable().set(3)
    write(port, 1, len.toAdd(1))
    write(port, 2, a)
    ifThen(a.equal(0x05), ()=>{
        write(port, 1, len.toAdd(2))
        write(port, 3, b)
        off.set(4)
    }, ()=>ifThen(a.equal(0x1b), ()=>{
        write(port, 1, len.toAdd(2))
        write(port, 3, b)
        off.set(4)
    }))
    forLoop(()=>variable().set(0), v=>v.lessThan(len), v=>v.add(1), v=>{
        const data = read(buffer, v).get()
        write(port, v.toAdd(off), data)
    })
    write(port, 0, 1)
    write(io, 17, 0)
}, ()=>{
    const len = read(io, 17).get()
    const off = variable().set(3)
    write(port, 1, len.toAdd(1))
    write(port, 2, a)
    ifThen(a.equal(0x05), ()=>{
        write(port, 1, len.toAdd(2))
        write(port, 3, b)
        off.set(4)
    }, ()=>ifThen(a.equal(0x1b), ()=>{
        write(port, 1, len.toAdd(2))
        write(port, 3, b)
        off.set(4)
    }))
    forLoop(()=>variable().set(0), v=>v.lessThan(len), v=>v.add(1), v=>{
        const data = read(buffer, v).get()
        write(port, v.toAdd(off), data)
    })
    write(port, 0, 1)
    write(io, 17, 0)
    write(io, 0, a)
}, ()=>{
    write(io, 0, 1)
    wait(0.05)
    write(io, 0, 0)
    wait(0.05)
    write(io, 17, 0)
    write(port, 1, 1)
    write(port, 2, 0x06)
    write(port, 0, 1)
}])

write(keyboard, 7, 0)