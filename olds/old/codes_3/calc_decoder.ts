import { doWhileLoop, ifNot, ifThen, switchValue, whileLoop } from "../generator/condition";
import { Value, Var, always, build, end, noprint, print, printflush, read, variable, write } from "../generator/core";

noprint(true)

const input = build("cell2")
const output = build("bank1")
const stack = build("cell3")
const stackTop = variable().set(0)

const enabled = read(build("cell1"), 56).get()
ifNot(enabled.isTrue(), end)

const inputPtr = variable().set(0)
const outputPtr = variable().set(0)

function ord(char: string){
    return char.charCodeAt(0)
}

const currentNumber = variable().set(0)
const inFloat = variable().set(false)
const hasNumber = variable().set(false)
const currentFloat = variable().set(0)

function writeOperation(op: Var<number>){
    print(" "+switchValue(op, [
        "(", "+", "-", "*", "/", "%", "^"
    ]).get())
    write(output, outputPtr, 0)
    outputPtr.add(1)
    write(output, outputPtr, op)
    outputPtr.add(1)
    write(output, outputPtr, 2)
}

const numberWrited = variable().set(false)

function writeNumber(){
    ifThen(hasNumber.isTrue(), ()=>{
        numberWrited.set(true)
        whileLoop(currentFloat.greaterThanEq(1), ()=>currentFloat.div(10))
        const num = currentNumber.toAdd(currentFloat)
        currentNumber.set(0)
        currentFloat.set(0)
        inFloat.set(false)
        hasNumber.set(false)
        print(" "+num)
        write(output, outputPtr, 1)
        outputPtr.add(1)
        write(output, outputPtr, num)
        outputPtr.add(1)
        write(output, outputPtr, 2)
    })
}

function push(data: Value<number>){
    write(stack, stackTop, data)
    // print("\nPUSH "+data+"\n")
    stackTop.add(1)
}

function getTop(data: Var<number>){
    ifThen(stackTop.equal(0), ()=>{
        data.set(0)
    }, ()=>read(stack, stackTop.toSub(1)).to(data))
}

function pop(data: Var<number> = variable()){
    ifThen(stackTop.lessThanEq(0), ()=>{
        write(build("cell1"), 56, 0)
        writeOperation(variable().set(1))
        write(build("cell1"), 57, 1)
        end()
    })
    stackTop.sub(1)
    read(stack, stackTop).to(data)
    // print("\nPOP "+data+"\n")
}

const operations = {
    "+": [0, false],
    "-": [0, false],
    "X": [1, false],
    "/": [1, false],
    "%": [1, false],
    "^": [2, true],
} as Record<string, [number, boolean]>

const levels = [-1]
    .concat(Object.entries(operations).map(a=>a[1][0]))

function process(char: Var<number>){
    ifThen(char.equal(ord(",")), ()=>{
        inFloat.set(true)
    }, ()=>ifThen(char.lessThanEq(0x39), ()=>ifThen(char.greaterThanEq(0x30), ()=>{
        hasNumber.set(true)
        ifThen(inFloat.isTrue(), ()=>{
            currentFloat.mul(10)
            currentFloat.add(char.toSub(0x30))
        }, ()=>{
            currentNumber.mul(10)
            currentNumber.add(char.toSub(0x30))
        })
    }, writeNumber), writeNumber))
    ifThen(char.equal(ord("(")), ()=>{
        push(0)
        // print(" )>"+stackTop)
    })
    ifThen(char.equal(ord(")")), ()=>{
        // print(" )"+stackTop)
        const op = variable<number>().set(-1)
        doWhileLoop(op.notEqual(0), ()=>{
            pop(op)
            // print(" "+op+"<"+stackTop)
            ifNot(op.equal(0), ()=>writeOperation(op))
        })
        numberWrited.set(true)
    })
    let index = 1
    for(const [key, [level, right]] of Object.entries(operations)){
        ifThen(char.equal(ord(key)), ()=>{
            ifThen(numberWrited.isFalse(), ()=>{
                print(" M0")
                write(output, outputPtr, 1)
                outputPtr.add(1)
                write(output, outputPtr, 0)
                outputPtr.add(1)
                write(output, outputPtr, 2)
            }, ()=>{
                numberWrited.set(false)
            })
            whileLoop(always, (breaking)=>{
                const top = variable()
                getTop(top)
                const currLevel = switchValue(top, levels).get()
                const cond = currLevel.toOpLessThan(level)
                cond.or(currLevel.toOpEqual(level).land(right))
                ifThen(cond.isTrue(), ()=>{
                    push(index)
                    // print(" "+key+">"+stackTop)
                    breaking()
                })
                pop(top)
                writeOperation(top)
            })
        })
        index++
    }
}

const current = read(input, inputPtr).get()
inputPtr.add(1)
whileLoop(current.notEqual(0x0), ()=>{
    process(current)
    read(input, inputPtr).to(current)
    inputPtr.add(1)
})
writeNumber()
whileLoop(stackTop.greaterThan(0), ()=>{
    const top = variable()
    pop(top)
    writeOperation(top)
})
// const i = variable().set(0)
// const last = variable().set(0)
// const code = read(output, i).get()
// print("\n")
// whileLoop(code.notEqual(2), ()=>{
//     read(output, i).to(code)
//     print(" "+code)
//     i.add(1)
//     ifThen(code.equal(3), ()=>{
//         write(output, i.toSub(1), 1)
//         write(output, i, 0)
//         // write(output, i.toSub(1), 1)
//         // write(output, i, read(output, i.toAdd(2)).get())
//         // write(output, i.toAdd(2), 0)
//     }, ()=>read(output, i).to(last))
//     print(" "+last)
//     i.add(1)
// })
printflush(build("message1"))
write(build("cell1"), 56, 0)
write(build("cell1"), 57, 1)