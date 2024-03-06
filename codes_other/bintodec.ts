import { ifThen, whileLoop } from "../generator/condition"
import { build, getlink, print, printflush, prop, sensor, variable } from "../generator/core"

const begin = 1

const i = variable().set(begin)
const t = variable().set(0)
const j = variable().set(1)

whileLoop(i.lessThan(variable("@links")), () => {
    const en = sensor(getlink(i).get(), prop("enabled")).get()
    ifThen(en.notEqual(0), () => {
        t.or(j)
    })
    j.shl(1)
    i.add(1)
})

print(t)
printflush(build("message1"))