import { forLoop, ifNot, ifThen } from "../generator/condition"
import { build, control, end, getlink, prop, sensor, variable } from "../generator/core"

const lastEnable = variable()

const enable = sensor(build("door1"), prop("enabled")).get()
const wri = sensor(build("door2"), prop("enabled")).get()

const j = variable().set(18)

forLoop(() => variable().set(10), v => v.lessThan(18), v => v.add(1), v => {
    const en = sensor(getlink(j).get(), prop("enabled")).get()
    control(getlink(v).get()).enabled(en)
    j.add(1)
})

ifNot(enable.notEqual(0), () => {
    ifThen(lastEnable.notEqual(0), () => {
        ifThen(wri.equal(0), () => {
            forLoop(() => variable().set(2), v => v.lessThan(10), v => v.add(1), v => {
                control(getlink(v).get()).enabled(0)
            })
        })
        lastEnable.set(0)
    })
    end()
})

lastEnable.set(1)

const i = variable().set(18)
ifThen(wri.notEqual(0), () => {
    forLoop(() => variable().set(2), v => v.lessThan(10), v => v.add(1), v => {
        const en = sensor(getlink(v).get(), prop("enabled")).get()
        control(getlink(i).get()).enabled(en)
        i.add(1)
    })
}, () => {
    forLoop(() => variable().set(2), v => v.lessThan(10), v => v.add(1), v => {
        const en = sensor(getlink(i).get(), prop("enabled")).get()
        control(getlink(v).get()).enabled(en)
        i.add(1)
    })
})