import { ifThen, whileLoop } from "../generator/condition"
import { build, end, read, write } from "../generator/core"

const str = `CALC 1.2BY ZZZ\nD`

ifThen(read(build("cell1"), 32).get().isFalse(), end)

for(const c of str){
    write(build("cell1"), 40, c.charCodeAt(0))
    const a = read(build("cell1"), 40).get()
    whileLoop(a.notEqual(0), ()=>read(build("cell1"), 40).to(a))
}

write(build("cell1"), 32, 0)