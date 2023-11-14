import { variable, Value, Var, write, read, Building } from "../core"

export function generateIO<T extends Record<string, number>>(cell: Var<Building>, a: T): {[K in keyof T]: ((value?: Value<number>) => Var<number>) & {addr: number}}{
    function reg(index, name){
        const v = variable("!"+cell.name+"_"+name)
        return Object.assign(function(value?: Value<number>): Var<number>{
            if(value != void 0){
                write(cell, index, value)
                return v
            }
            read(cell, index).to(v)
            return v
        }, {addr: index})
    }
    const obj = {}
    Object.entries(a).map(([k, v]) => obj[k] = reg(v, k))
    return obj as any
}