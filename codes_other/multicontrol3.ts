import { ifNot } from "../generator/condition";
import { build, end, jumpMark, jumpToAfter, prop, sensor, unitBind, unitType, variable } from "../generator/core";
import { createMemoryModule } from "../generator/private/memory";
import { multiControl } from "../generator/private/unit";

const maxUnits = variable("max_units").set(1)
const utype = variable("unit_type").set(unitType("flare"))
const target = variable("container").set(build("container1"))
const configSource = variable("config_source").set(build("sorter1"))

const {unit} = multiControl("units", 4, utype, maxUnits)

unit.controls.move(variable("@thisx"), variable("@thisy"))
