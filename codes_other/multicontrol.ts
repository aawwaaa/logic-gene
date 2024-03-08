import { ifNot } from "../generator/condition";
import { build, end, jumpMark, jumpToAfter, prop, sensor, unitBind, unitType, variable } from "../generator/core";
import { createMemoryModule } from "../generator/private/memory";
import { multiControl } from "../generator/private/unit";

const maxUnits = variable("max_units").set(4)
const utype = variable("unit_type").set(unitType("flare"))
const target = variable("container").set(build("container1"))
const configSource = variable("config_source").set(build("sorter1"))

const {unit} = multiControl("units", 128, utype, maxUnits)

const config = sensor(configSource, prop("config")).get()
const unitItem = sensor(unit, prop("firstItem")).get()

ifNot(unitItem.notEqual(config), () => {
    unit.controls.move(sensor(target, prop("x")).get(), sensor(target, prop("y")).get())
    unit.controls.itemDrop(target, 9999)
    end()
})

const {x: coreX, y: coreY, building: core} = unit.locates.building("core", false).packed()
unit.controls.move(coreX, coreY)
ifNot(unitItem.notEqual(null), () => {
    unit.controls.itemTake(core, config, 9999)
    end()
})
unit.controls.itemDrop(core, 9999)