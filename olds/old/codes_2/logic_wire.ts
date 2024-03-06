import { ifNot, switchValue } from "../generator/condition"
import {item, sensor, build, prop, end, control, variable, jumpToAfter} from "../generator/core"

const last = variable<boolean>()
let jump;

for(let i = 0; i < 10; i++){
    if(jump) jump.here()
    const b = build("switch"+(i+1))
    const en = sensor(b, prop("enabled")).get()
    jump = jumpToAfter(b.equal(null))
    ifNot(en.equal(last), ()=>{
        last.set(en)
        for(let j = 0; j < 10; j++){
            if(j == i) continue
            control(build("switch"+(j+1))).enabled(en)
        }
    })
}
jump.here()