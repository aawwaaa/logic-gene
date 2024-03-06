import { doWhileLoop, ifNot, ifThen, switchCounter, switchValue, whileLoop } from "../generator/condition";
import { Value, Var, always, build, end, print, printflush, read, variable, write } from "../generator/core";

const input = build("bank1")
const stack = build("cell2")
const stackTop = variable().set(0)

const enabled = read(build("cell1"), 57).get()
ifNot(enabled.isTrue(), end)

const inputPtr = variable().set(0)

function ord(char: string){
    return char.charCodeAt(0)
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
        write(build("cell1"), 61, 1)
        write(build("cell1"), 57, 0)
        end()
    })
    stackTop.sub(1)
    read(stack, stackTop).to(data)
    // print("\nPOP "+data+"\n")
}

function process(code: Var<number>, data: Var<number>){
    ifThen(code.equal(1), ()=>{
        push(data)
        // print(" "+data)
    })
    ifThen(code.equal(0), ()=>{
        const v1 = variable().set(0), v2 = variable().set(0);
        pop(v1);pop(v2)
        // print("\n"+v2+" "+switchValue(data, [
        //     "(", "+", "-", "*", "/", "%", "^"
        // ]).get()+" "+v1+" = ")
        switchCounter(data, 1, [
            ()=>v2.set(v2),
            ()=>v2.add(v1),
            ()=>v2.sub(v1),
            ()=>v2.mul(v1),
            ()=>v2.div(v1),
            ()=>v2.mod(v1),
            ()=>v2.pow(v1),
        ])
        // print(v2)
        push(v2)
    })
}

const current = read(input, inputPtr).get()
inputPtr.add(1)
const data = read(input, inputPtr).get()
inputPtr.add(1)
whileLoop(current.notEqual(0x2), ()=>{
    process(current, data)
    read(input, inputPtr).to(current)
    inputPtr.add(1)
    read(input, inputPtr).to(data)
    inputPtr.add(1)
})
pop(data)
// print("\n"+data)
// printflush(build("message1"))
write(build("cell1"), 60, data)
write(build("cell1"), 57, 0)