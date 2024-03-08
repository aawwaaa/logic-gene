import { Line, Value, Var, always, counter, jumpToAfter, operation, variable } from "../core";

interface MemoryModule{
    read(address: Value<number>, out: Var<number>): void
    write(address: Value<number>, value: Value<number>): void
}
export function createMemoryModule(name: string, size: number): MemoryModule {
    const jmp = jumpToAfter(always)
    const begin = jmp.line.lineNumber + 1
    const address = variable<number>(":address")
    const value = variable<number>(":value")
    const ret = variable<number>(":ret")
    address.mul(2)
    counter.add(address)
    for(let i = 0; i < size; i++){
        const cell = variable<number>("::"+name+":cell:"+i)
        value.set(cell)
        counter.set(ret)
    }
    const write = Line.getLength()
    address.mul(2)
    counter.add(address)
    for(let i = 0; i < size; i++){
        const cell = variable<number>("::"+name+":cell:"+i)
        cell.set(value)
        counter.set(ret)
    }
    jmp.here()
    return {
        read(addr, out) {
            address.set(addr)
            operation("add", counter, 1).to(ret)
            counter.set(begin)
            out.set(value)
        },
        write(addr, v) {
            address.set(addr)
            value.set(v)
            operation("add", counter, 1).to(ret)
            counter.set(write)
        }
    };
}