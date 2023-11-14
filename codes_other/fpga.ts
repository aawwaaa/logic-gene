import { forLoop, ifNot, ifThen, switchCounterJump, whileLoop } from "../generator/condition";
import { build, control, end, getlink, prop, read, sensor, variable, write } from "../generator/core";

const mem = build("cell1")
const enable = build("door1")

const pinBegin = 2
const pinLen = 16

const instructionBegin = pinBegin + pinLen

const memBegin = 20
const setedBegin = 48

ifNot(enable.notEqual(0), () => {
    forLoop(() => variable().set(0), v => v.lessThan(64), v => v.add(1), v => {
        write(mem, v, 0)
    })
    end()
})

forLoop(() => variable().set(0), v => v.lessThan(pinLen), v => v.add(1), v => {
    const en = sensor(getlink(v.toAdd(pinBegin)).get(), prop("enabled")).get()
    en.sub(2)
    write(mem, v, en)
    write(mem, v.toAdd(setedBegin), 0)
})

const inst = variable().set(instructionBegin)
const commandSorter = getlink(inst).get()
whileLoop(() => commandSorter.notEqual(0), (br) => {
    getlink(inst).to(commandSorter)
    const commandI = sensor(commandSorter, prop("config")).get()
    const command = sensor(commandI, prop("id")).get()
    const p1 = sensor(sensor(getlink(inst.toAdd(1)).get(), prop("config")).get(), prop("id")).get()
    const p2 = sensor(sensor(getlink(inst.toAdd(2)).get(), prop("config")).get(), prop("id")).get()
    const r = sensor(sensor(getlink(inst.toAdd(3)).get(), prop("config")).get(), prop("id")).get()
    const v1 = read(mem, p1).get()
    ifThen(v1.lessThan(0), () => v1.add(2))
    const v2 = read(mem, p2).get()
    ifThen(v2.lessThan(0), () => v2.add(2))
    switchCounterJump(command, [() => {}, () => {
        v1.and(v2)
    }, () => {
        v1.or(v2)
    }, () => {
        v1.opNotEqual(1)
    }, () => {
        v1.xor(v2)
    }, () => {
        const a = p1.toAdd(memBegin)
        ifThen(v2.notEqual(0), () => write(mem, a, v1))
        read(mem, a).to(v1)
    }, () => {
        const a = p1.toAdd(memBegin)
        ifThen(v1.notEqual(0),
            () => ifThen(v2.notEqual(0), () => {}, () => write(mem, a, 1)),
            () => ifThen(v2.notEqual(0), () => write(mem, a, 0)))
        read(mem, a).to(v1)
    }])
    write(mem, r, v1)
    write(mem, r.toAdd(setedBegin), 1)
    ifThen(commandI.strictEqual(null), br)
    inst.add(4)
})

forLoop(() => variable().set(0), v => v.lessThan(pinLen), v => v.add(1), v => {
    const seted = read(mem, v.toAdd(setedBegin)).get()
    ifNot(seted.equal(0), () => {
        const en = read(mem, v).get()
        control(getlink(v.toAdd(pinBegin)).get()).enabled(en)
    })
})