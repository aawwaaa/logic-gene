import { Building, Unit, Value, Var, prop, sensor } from "../core";

export function getTouchPos(turret: Value<Unit | Building>, display: Value<Building>){
    const sx = sensor(turret, prop("shootX")).get()
    const sy = sensor(turret, prop("shootY")).get()
    const si = sensor(turret, prop("shooting")).get()
    const ds = sensor(display, prop("size")).get()
    ds.div(2).sub(0.25)
    const dx = sensor(display, prop("x")).get()
    const dy = sensor(display, prop("y")).get()
    sx.mul(32).sub(dx.sub(ds).mul(32))
    sy.mul(32).sub(dy.sub(ds).mul(32))
    return [sx, sy, si] as [Var<number>, Var<number>, Var<boolean>]
}