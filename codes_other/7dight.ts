import { forLoop, ifThen, switchCounterJump } from "../generator/condition"
import { build, control, getlink, item, operation, prop, sensor, variable } from "../generator/core"

const num = variable().set(0)

forLoop(() => variable().set(0), v => v.lessThan(4), v => v.add(1), v => {
    const en = sensor(getlink(v).get(), prop("enabled")).get()
    const a = operation("pow", 2, v).get()
    ifThen(en.notEqual(0), () => num.or(a))
})

const values = [
    "1110111",
    "0010010",
    "1011101",
    "1011011",
    "0111010",
    "1101011",
    "1101111",
    "1010010",
    "1111111",
    "1111011",
    "1111110",
    "0101111",
    "1100101",
    "0011111",
    "1101101",
    "1101100"
]

function gene(v, ...ids){
    ids.forEach(id => {
        control(build("sorter"+id)).config(v.includes("1")? item("metaglass"): item("coal"))
    })
}

switchCounterJump(num, values.map(v => () => {
    gene([v[0], v[1]], 1)
    gene(v[0], 2, 3, 4)
    gene([v[0], v[2]], 5)
    gene(v[1], 6, 7, 8)
    gene(v[2], 9, 10, 11)
    gene([v[1], v[3], v[4]], 12)
    gene(v[3], 13, 14, 15)
    gene([v[2], v[3], v[5]], 16)
    gene(v[4], 17, 18, 19)
    gene(v[5], 20, 21, 22)
    gene([v[4], v[6]], 23)
    gene(v[6], 24, 25, 26)
    gene([v[6], v[5]], 27)
}))