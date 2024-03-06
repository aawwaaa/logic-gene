import { ifNot, ifThen } from "../generator/condition"
import { build, control, prop, read, sensor, write } from "../generator/core"

const keys = [
    
] as [string, number, "add" | "confirm" | "confirmWithData" | "confirmWDP", string | number[], string | number[], string?][]

for(let i = 0; i < 21; i++){
    keys.push(["e"+i, i+1, "confirm", [0x1b, i], [0x1b, i]])
}

keys.push(["tab", 22, "confirmWithData", [0x1b, 21], [0x1b, 21]])
keys.push(["enter", 23, "confirmWDP", [0x0a, 0x0], [0x0a, 0x0]])
keys.push(["backspace", 24, "add", [0x08], [0x08]])


const io = build("cell1")
const inCtrl = read(io, 8).get()
const inShift = read(io, 9).get()
const inCaps = read(io, 10).get()

function getOrd(def: string | number[], shi: string | number[], caps: string | number[]){
    if(typeof(def)=="string") def = def.split("").map(a=>a.charCodeAt(0))
    if(typeof(shi)=="string") shi = shi.split("").map((a: string)=>a.charCodeAt(0))
    if(typeof(caps)=="string") caps = caps.split("").map((a: string)=>a.charCodeAt(0))
    return [def, shi, caps]
}

function output(data: number[], mode: number){
    data.forEach((data, i) => {
        write(io, i, data)
    });
    write(io, 7, mode)
}

for(const [_, id, _mode, _def, _shi, __caps] of keys){
    const mode = {
        add: 1,
        confirm: 2,
        confirmWithData: 3, 
        confirmWDP: 4
    }[_mode]
    const _caps = __caps ?? _def
    const [def, shi, caps] = getOrd(_def, _shi, _caps)
    ifNot(sensor(build("switch"+id), prop("enabled")).get().isFalse(), ()=>{
        control(build("switch"+id)).enabled(false)
        ifThen(inCtrl.isTrue(), ()=>{
            output([0x5, ...def], 2)
        }, ()=>ifThen(inShift.isTrue(), ()=>{
            output(shi, mode)
        }, ()=>ifThen(inCaps.isTrue(), ()=>{
            output(caps, mode)
        }, ()=>{
            output(def, mode)
        })))
    })
}