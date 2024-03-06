import { doWhileLoop, ifNot, ifThen, switchCounter, switchValue, whileLoop } from "../generator/condition";
import { Value, Var, always, build, end, operation, print, printflush, read, variable, write } from "../generator/core";

const io = build("cell1")

const enabled = read(io, 58).get()
ifNot(enabled.isTrue(), end)

const hasError = read(io, 61).get()
const num = read(io, 60).get()

function printChar(char: Value<number>){
    write(io, 40, char)
    const result = read(io, 40).get()
    whileLoop(result.notEqual(0), ()=>read(io, 40).to(result))
}

ifThen(hasError.isTrue(), ()=>{
    for(const c of "ERROR!") printChar(c.charCodeAt(0))
    write(io, 61, 0)
}, ()=>{
    ifThen(num.lessThan(0), ()=>{
        // print("- ")
        printChar("-".charCodeAt(0))
    })
    num.abs()
    const int = num.toFloor()
    const len = variable().set(0)
    const res = int.toAdd(0)
    whileLoop(res.notEqual(0), ()=>{
        len.add(1)
        res.div(10).floor()
    })
    print(len+" ")
    doWhileLoop(len.greaterThan(0), ()=>{
        const n = int.toDiv(operation("pow", 10, len.toSub(1)).get()).floor().mod(10).add(0x30)
        printChar(n)
        // print(n.toSub(0x30)+" ")
        len.sub(1)
    })
    const flo = num.toMod(1)
    const scale = Math.pow(10, 7)
    flo.mul(scale)
    ifThen(flo.toMod(1).greaterThan(0.5), ()=>{
        flo.ceil()
    }, ()=>flo.floor())
    flo.div(scale)
    ifThen(flo.notEqual(0), ()=>{
        printChar(",".charCodeAt(0))
        // print(". ")
        const i = variable().set(0)
        whileLoop(flo.notEqual(0), (br)=>{
            flo.mul(10)
            const n = flo.toFloor().add(0x30)
            printChar(n)
            // print(n.toSub(0x30)+" ")
            flo.mod(1)
            ifThen(i.greaterThan(6), br)
            i.add(1)
        })
    })
})

write(io, 58, 0)
// printflush(build("message1"))