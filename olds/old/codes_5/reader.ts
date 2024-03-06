import { doWhileLoop, forLoop, ifNot, whileLoop } from "../generator/condition";
import { Item, Value, Var, always, build, control, end, item, jumpMark, jumpToAfter, lookup, print, printflush, prop, read, sensor, variable, write } from "../generator/core";

const m = jumpMark()
const target = variable().set(build("duct1"))
m.jumpTo(target.equal(null))
const bits = 8
const beginItem = item("beryllium")
const splitItem = item("oxide")
const endItem = item("tungsten")

function waitItem(t: Value<Item>){
    const item = variable().set(null)
    doWhileLoop(item.notEqual(t), ()=>{
        sensor(target, prop("firstItem")).to(item)
        ifNot(item.notEqual(endItem), end)
    })
}

function readItem(t: Var<Item>){
    const item = variable().set(null)
    const mark = jumpMark()
    sensor(target, prop("firstItem")).to(item)
    ifNot(item.notEqual(endItem), end)
    mark.jumpTo(item.equal(null))
    mark.jumpTo(item.equal(beginItem))
    mark.jumpTo(item.equal(splitItem))
    t.set(item)
}

function ord(i: Var<Item>, out: Var<number>){
    // control(target).enabled(false)
    out.set(-1)
    // const i = variable().set(null)
    // whileLoop(i.notEqual(item), ()=>{
    //     out.add(1)
    //     lookup("item", out).to(i)
    // })
    const items = [
        "copper",
        "lead",
        "metaglass",
        "graphite",
        "sand",
        "coal",
        "titanium",
        "thorium",
        "scrap",
        "silicon",
        "plastanium",
        "phase-fabric",
        "surge-alloy",
        "spore-pod",
        "blast-compound",
        "pyratite"
    ] as any[]
    const j1 = items.map(a=>jumpToAfter(i.equal(item(a))))
    const j2 = j1.map((a, i)=>{
        a.here()
        out.set(i)
        return jumpToAfter(always)
    })
    j2.map(a=>a.here())
    control(target).enabled(true)
}

function readNumber(v: Var<number>){
    v.set(0)
    const item = variable().set(null)
    const i = variable().set(0)
    const current = variable().set(bits)
    doWhileLoop(current.greaterThan(0), ()=>{
        current.sub(4)
        readItem(item)
        waitItem(splitItem)
        ord(item, i)
        // print(item+" "+i)
        i.shl(current)
        v.or(i)
    })
}

const io = build("bank1")
const enableAddr = 256
const lengthAddr = 257
const dataAddr = 258
const length = variable().set(0)

print("Idle.")
printflush(build("message1"))

waitItem(beginItem)

print("Read length.")
printflush(build("message1"))

readNumber(length)

write(io, lengthAddr, length)

const data = variable().set(-1)

forLoop(()=>variable().set(0), i=>i.lessThan(length), i=>i.add(1), i=>{
    print("Read data: "+i+"/"+length+"  Last: "+data+".")
    printflush(build("message1"))
    readNumber(data)
    write(io, i.toAdd(dataAddr), data)
    write(build("cell1"), 0, data)
})

write(io, enableAddr, true)
