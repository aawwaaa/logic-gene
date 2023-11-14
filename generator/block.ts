import { always, counter, jumpToAfter, operation, variable } from "./core";

const v = variable("::ret")

export function defineBlock(code: () => void){
    const mark = jumpToAfter(always)
    const line = mark.line.lineNumber + 1
    code()
    operation("add", v, 1).to(counter)
    mark.here()
    return () => {
        v.set(counter)
        counter.set(line)
    }
}