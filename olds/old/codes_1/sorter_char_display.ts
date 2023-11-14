import { ifNot, ifThen, whileLoop } from "../generator/condition";
import { always, build, control, item, read, variable, write } from "../generator/core";

const charBank = build("bank1")
const char = read(build("cell1"), 0).get()

const data = read(charBank, char).get()

const on = item("metaglass")
const off = item("coal")

for(let i = 0; i < 20; i++){
    const sorter1 = build("sorter"+(i * 2 + 1))
    const sorter2 = build("sorter"+(i * 2 + 2))
    ifThen(data.toAnd(Math.pow(2, i)).notEqual(0), () => {
        control(sorter1).config(on)
        control(sorter2).config(on)
    }, () => {
        control(sorter1).config(off)
        control(sorter2).config(off)
    })
}
var sorter1 = build("sorter41")
ifThen(data.toAnd(Math.pow(2, 20)).notEqual(0), () => {
    control(sorter1).config(on)
}, () => {
    control(sorter1).config(off)
})
var sorter1 = build("sorter42")
ifThen(data.toAnd(Math.pow(2, 21)).notEqual(0), () => {
    control(sorter1).config(on)
}, () => {
    control(sorter1).config(off)
})

const src = build("cell1")
const dst = build("cell2")
const index = variable().set(0)
const ended = variable().set(char).opEqual(0)
whileLoop(always, (breaking)=>{
    const data = read(src, index.toAdd(1)).get()
    ifNot(data.notEqual(0), ()=>ended.set(true))
    ifNot(ended.isFalse(), ()=>data.set(0))
    write(dst, index, data)
    ifNot(index.lessThan(16), breaking)
    index.add(1)
})