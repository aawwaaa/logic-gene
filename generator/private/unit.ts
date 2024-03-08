import { UnitType, UnitVar, Value, Var, jumpMark, jumpToAfter, prop, sensor, unitBind, variable } from "../core";
import { createMemoryModule } from "./memory";

export function multiControl(memoryName: string, size: number, unitType: Value<UnitType>, maxUnits: Var<number>): {currentIndex: Var<number>, unit: UnitVar}{
    const units = createMemoryModule(memoryName, size)

    const currentUnitIndex = variable()
    const currentUnit = variable()

    currentUnitIndex.add(1).mod(maxUnits)
    units.read(currentUnitIndex, currentUnit)

    var unit = unitBind(currentUnit)

    const dead = sensor(unit, prop("dead")).get()

    var mark = jumpToAfter(unit.equal(0))
    var mark2 = jumpToAfter(dead.equal(0))
    mark.here()
    var mark3 = jumpMark()
    var newUnit = unitBind(unitType)
    unit.set(newUnit)
    const controlled = sensor(unit, prop("controlled")).get()
    mark3.jumpTo(controlled.notEqual(0))
    units.write(currentUnitIndex, unit)

    mark2.here()

    return {
        currentIndex: currentUnitIndex,
        unit: unit
    }
}