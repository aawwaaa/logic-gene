import { doWhileLoop, forLoop, ifThen } from "../generator/condition";
import { build, read, variable, write } from "../generator/core";
import { copyData } from "../generator/data";

for(const fr of [build("bank1"), build("bank2")]){
    const to = fr == build("bank1")? build("bank2"): build("bank1")
    const en = read(fr, 0).get()
    ifThen(en.equal(true), ()=>{
        const len = read(fr, 1).get()
        copyData(fr, 2, to, 258, len)
        write(to, 257, len)
        write(to, 256, 1)
        write(fr, 0, 0)
    })
}

const cell = build("cell1")
const bank = build("bank1")
const en = read(bank, 256).get()

ifThen(en.equal(true), ()=>{
    const len = read(bank, 257).get()
    forLoop(()=>variable().set(0), v=>v.lessThan(len), v=>v.add(1), v=>{
        write(cell, 0, read(bank, v.toAdd(258)).get())
        const i = variable()
        doWhileLoop(i.notEqual(-1), ()=>read(cell, 0).to(i))
    })
    write(bank, 256, 0)
})