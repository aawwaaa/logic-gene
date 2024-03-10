import { forLoop, ifNot, ifThen } from "../generator/condition"
import { build, control, end, getlink, prop, sensor, variable } from "../generator/core"

const lastEnable = variable()

const dataBegin = 14

const enable = sensor(build("door1"), prop("enabled")).get()
const wri = sensor(build("door2"), prop("enabled")).get()

ifNot(enable.notEqual(0), () => {
    ifThen(lastEnable.notEqual(0), () => {
        ifThen(wri.equal(0), () => {
            forLoop(() => variable().set(6), v => v.lessThan(14), v => v.add(1), v => {
                control(getlink(v).get()).enabled(0)
            })
        })
        lastEnable.set(0)
    })
    end()
})

lastEnable.set(1)

const addr = variable().set(0)

forLoop(() => variable().set(5), v => v.greaterThanEq(2), v => v.sub(1), v => {
    const en = sensor(getlink(v).get(), prop("enabled")).get()
    addr.shl(1)
    ifThen(en.notEqual(0), () => addr.or(1))
})

ifThen(wri.notEqual(0), () => {
    const i = addr.toMul(8).add(dataBegin)

    forLoop(() => variable().set(6), v => v.lessThan(14), v => v.add(1), v => {
        const en = sensor(getlink(v).get(), prop("enabled")).get()
        control(getlink(i).get()).enabled(en)
        i.add(1)
    })
}, () => {
    const i = addr.toMul(8).add(dataBegin)

    forLoop(() => variable().set(6), v => v.lessThan(14), v => v.add(1), v => {
        const en = sensor(getlink(i).get(), prop("enabled")).get()
        control(getlink(v).get()).enabled(en)
        i.add(1)
    })
})