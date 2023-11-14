import { ifNot } from "../generator/condition";
import { build, control, prop, sensor, write } from "../generator/core"

const keys = [
    ",", "+", "-", "^", "X", "/", "%", "(", ")", "\x08", "\x01"
]

let i = 0;
for(const chr of keys){
    ifNot(sensor(build("switch"+(++i)), prop("enabled")).get().isFalse(), ()=>{
        control(build("switch"+i)).enabled(false)
        write(build("cell1"), 0, chr.charCodeAt(0))
    })
}