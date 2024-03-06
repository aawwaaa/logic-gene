import { forLoop, ifNot, switchValue } from "./condition";
import { Value, Building, variable, write, read, SingleResultArr, dynamicVariable, print } from "./core";

export namespace data{
    export function copy(source: Value<Building>, sourceOffset: Value<number>, target: Value<Building>, targetOffset: Value<number>, length: Value<number>){
        forLoop(()=>variable().set(0), v=>v.lessThan(length), v=>v.add(1), v=>{
            write(target, v.toAdd(targetOffset), read(source, v.toAdd(sourceOffset)).get())
        })
    }

    export function equals(source: Value<Building>, sourceOffset: Value<number>, target: Value<Building>, targetOffset: Value<number>, length: Value<number>){
        const [v, s] = dynamicVariable<boolean>()
        v.set(true)
        forLoop(()=>variable().set(0), v=>v.lessThan(length), v=>v.add(1), v=>{
            const a = read(source, v.toAdd(sourceOffset)).get()
            const b = read(target, v.toAdd(targetOffset)).get()
            ifNot(a.equal(b), ()=>v.set(false))
        })
        return s;
    }
}

export function stringConstantDynamic(target: Value<Building>, offset: Value<number>, string: string){
    const ptr = variable().set(offset)
    for(const c of string){
        write(target, ptr, c.charCodeAt(0))
        ptr.add(1)
    }
}

export function stringConstant(target: Value<Building>, offset: number, string: string){
    for(const c of string){
        write(target, offset, c.charCodeAt(0))
        offset++
    }
}

const alts = {
}
const strs = new Array(128).fill(null).map((_, i) => 
    i < 32 || i == 127? String.fromCharCode(i) == "\n"? "\n": "["+i+"]": String.fromCharCode(i)
).map(a => alts[a] ?? a)
export function printString(target: Value<Building>, lengthAddr: Value<number>, begin: Value<number>){
    const len = read(target, lengthAddr).get()
    forLoop(()=>variable().set(0), v=>v.lessThan(len), v=>v.add(1), v=>{
        const data = read(target, v.toAdd(begin)).get()
        const str = switchValue(data, strs).get()
        print(str)
    })
}