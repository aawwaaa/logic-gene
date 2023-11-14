import { doWhileLoop, ifThen, init, whileLoop } from "../generator/condition";
import { build, control, print, printflush, prop, sensor, set, variable } from "../generator/core";

const src = build("conveyor1")
const buffer = build("router1")
const count = variable<number>()

init(()=>{
    count.set(0)
})

control(buffer).enabled(0)
control(src).enabled(1)
ifThen(sensor(buffer, prop("totalItems")).get().greaterThan(0), ()=>{
    const itemc = variable<number>()
    doWhileLoop(itemc.greaterThan(0), ()=>{
        control(src).enabled(0)
        control(buffer).enabled(1)
        sensor(buffer, prop("totalItems")).to(itemc)
    })
    control(src).enabled(0)
    control(buffer).enabled(0)
    count.add(1)
})
print("Count: "+count)
printflush(build("message1"))