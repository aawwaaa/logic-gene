import { Var, sensor, getlink, prop, control } from "../core"

export function binaryPort(begin: number, length: number): {read(out: Var<number>): void, write(val: Var<number>): void}{
    return {
        read(out){
            out.set(0)
            for(let i = 0; i < length; i++){
                const enabled = sensor(getlink(begin + i).get(), prop("enabled")).get()
                out.shl(1).or(enabled)
            }
        },
        write(val){
            for(let i = 0; i < length; i++){
                const output = val.toAnd(1 << (length - i - 1))
                control(getlink(begin + i).get()).enabled(output)
            }
        }
    }
}
