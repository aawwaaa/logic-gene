import { build, prop, sensor, write } from "../generator/core"

const keys = [
    ["ctrl", 1, 8],
    ["shift", 2, 9],
    ["capslock", 3, 10]
] as [string, number, number][]

for(const [_, id, addr] of keys){
    const en = sensor(build("switch"+id), prop("enabled")).get()
    write(build("cell1"), addr, en)
}