import { doWhileLoop, forLoop, ifNot, whileLoop } from "../generator/condition";
import { Item, Value, Var, build, control, end, item, lookup, operation, print, printflush, prop, read, sensor, variable, wait, write } from "../generator/core";

const target = build("source1")
const targetConv = build("conveyor1")

function writeItem(item: Value<Item>){
    const current = variable().set(null)
    doWhileLoop(current.notEqual(item), ()=>{
        control(target).config(item)
        sensor(targetConv, prop("firstItem")).to(current)
    })
    wait(0.07)
}

const bits = 8
const beginItem = item("beryllium")
const splitItem = item("oxide")
const endItem = item("tungsten")

function writeNumber(num: Var<number>){
    const current = variable().set(bits)
    doWhileLoop(current.greaterThan(0), ()=>{
        current.sub(4)
        const dataBand = operation("shl", 0xf, current).get()
        const data = num.toAnd(dataBand).shr(current)
        const item = lookup("item", data).get();
        writeItem(item)
        writeItem(splitItem)
    })
}

const io = build("bank1")
const enableAddr = 0
const lengthAddr = 1
const dataAddr = 2

print("Idle.")
printflush(build("message1"))

control(target).config(null)

ifNot(read(io, enableAddr).get().isTrue(), end)

writeItem(beginItem)

const length = read(io, lengthAddr).get()

print("Write length: "+length+".")
printflush(build("message1"))

writeNumber(length)

forLoop(()=>variable().set(0), i=>i.lessThan(length), i=>i.add(1), i=>{
    const data = read(io, i.toAdd(dataAddr)).get()
    print("Write data: "+i+"/"+length+"  "+data+".")
    printflush(build("message1"))
    writeNumber(data)
})

writeItem(endItem)

write(io, enableAddr, 0)