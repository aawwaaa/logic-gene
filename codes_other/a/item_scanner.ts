import { forLoop, ifNot, whileLoop } from "../generator/condition";
import { build, end, getlink, jumpMark, links, prop, sensor, time, variable, write } from "../generator/core";
import { generateIO } from "../generator/private/io";

const io = generateIO(build("cell1"), {
    beginTime: 0,
    bankIndex: 1,
    banks: 2
})

io.bankIndex(-1)
const banks = links.toSub(1)
io.banks(banks)

const target = getlink(24 + 1).get()

ifNot(target.notEqual(0), end)
const begin = io.beginTime()
ifNot(begin.equal(0), end)

io.beginTime(0)

whileLoop(time.lessThan(begin), () => {})

const t = variable().set(time)

const current = variable().set(1)
const mark = jumpMark()
const bank = getlink(current).get()
io.bankIndex(current)
const p = variable().set(0)
const mark2 = jumpMark()

const i = sensor(target, prop("firstItem")).get()
const id = sensor(i, prop("id")).get()
const c = sensor(target, prop("totalItems")).get()
write(bank, p, c.shl(8).or(id))
p.add(1)

const deltaT = time.toSub(t)
write(bank, p, time.toSub(begin).shl(8).or(deltaT))
p.add(1)
t.set(time)

mark2.jumpTo(p.lessThan(512))
current.add(1)
mark.jumpTo(current.lessThan(banks))