import { ifNot } from "../generator/condition";
import { sensor, build, prop, end, control } from "../generator/core";

const en1 = sensor(build("switch1"), prop("enabled")).get()
const en2 = sensor(build("switch2"), prop("enabled")).get()

const data = en1.land(en2)

for(let i = 0; i < 10; i++){
    const b = build("switch"+(i + 3))
    ifNot(b.notEqual(null), end)
    control(b).enabled(data)
}