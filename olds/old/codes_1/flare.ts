import { ifThen } from "../generator/condition";
import { build, end, item, prop, sensor, unitBind, unitType } from "../generator/core";

const unit = unitBind(unitType("flare"))
const container = build("vault1")

ifThen(sensor(unit, item("pyratite")).get().lessThan(8), ()=>{
    const x = sensor(container, prop("x")).get()
    const y = sensor(container, prop("y")).get()
    unit.controls.move(x, y)
    unit.controls.itemTake(container, item("pyratite"), 10)
    end()
})

ifThen(sensor(build("switch1"), prop("enabled")).get().isFalse(), ()=>{
    unit.controls.move(965,899)
    end()
})

const result = unit.rader({
    type: ["enemy","attacker"]
}).get()

ifThen(result.notEqual(null), () => {
    const x = sensor(result, prop("x")).get()
    const y = sensor(result, prop("y")).get()
    unit.controls.approach(x, y, 4)
    unit.controls.targetp(result, true)
}, () => {
    // var {found, x, y} = unit.locates.building("turret", true).packed()
    const ux = sensor(unit, prop("x")).get()
    const uy = sensor(unit, prop("y")).get()
    // ifThen(found.isTrue(), ()=>{
    //     unit.controls.move(x, y)
    //     const vx = x.toSub(ux)
    //     const vy = y.toSub(uy)
    //     const len = vx.toLen(vy)
    //     const x1 = vx.toDiv(len).mul(10).add(ux)
    //     const y1 = vy.toDiv(len).mul(10).add(uy)
    //     unit.controls.target(x1, y1, true)
    //     end()
    // })
    var {found, x, y} = unit.locates.building("core", true).packed()
    ifThen(found.isTrue(), ()=>{
        unit.controls.move(x, y)
        const vx = x.toSub(ux)
        const vy = y.toSub(uy)
        const len = vx.toLen(vy)
        const x1 = vx.toDiv(len).mul(10).add(ux)
        const y1 = vy.toDiv(len).mul(10).add(uy)
        unit.controls.target(x1, y1, true)
        end()
    })
    unit.controls.unbind()
    end()
})