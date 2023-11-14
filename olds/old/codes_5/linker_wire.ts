import { doWhileLoop, forLoop, ifThen } from "../generator/condition";
import { build, print, printflush, read, variable, write } from "../generator/core";
import { copyData } from "../generator/data";

for(const fr of [build("bank1"), build("bank2")]){
    const to = fr == build("bank1")? build("bank2"): build("bank1")
    const [a, b, c, d, e, f] = fr == build("bank1")?
        [0, 1, 2, 2, 1, 0]:
        [256, 257, 258, 258, 257, 256]
    const en = read(fr, a).get()
    ifThen(en.equal(true), ()=>{
        const i = variable()
        doWhileLoop(i.notEqual(0), ()=>read(to, f).to(i))
        const len = read(fr, b).get()
        copyData(fr, c, to, d, len)
        write(to, e, len)
        write(to, f, 1)
        write(fr, a, 0)
    })
}