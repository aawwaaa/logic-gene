import { ifNot } from "../generator/condition";
import { sensor, build, prop, end, control } from "../generator/core";

const en = sensor(build("switch1"), prop("enabled")).get()

const data = en.opNotEqual(1)

for(let i = 0; i < 10; i++){
    const b = build("switch"+(i + 2))
    ifNot(b.notEqual(null), end)
    control(b).enabled(data)
}