import { forLoop, ifThen } from "../generator/condition"
import { build, drawflush, operation, read, variable } from "../generator/core"
import { charDisplay } from "../generator/private/char_display"

const indexBegin = variable().set(0)
const indexEnd = variable().set(32)

const display = charDisplay(8)
const dataCell = build("bank1")

forLoop(() => variable().set(indexBegin), v => v.lessThan(indexEnd), v => v.add(1), v => {
    const data = read(dataCell, v).get()
    const x = v.toMod(16).mul(8).add(32)
    const y = operation("sub", 16, v.toDiv(16).floor()).get().mul(8).add(32)
    display.display(x, y, data)
    ifThen(v.toMod(8).equal(7), () => {
        drawflush(build("display1"))
    })
})

