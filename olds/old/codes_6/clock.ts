import { ifNot } from "../../../generator/condition"
import { build, control, end, operation, prop, sensor, time, variable } from "../../../generator/core"

const ticks = variable("ticks").set(50)

const last = variable()

const enabled = sensor(build("switch1"), prop("enabled")).get()

ifNot(enabled.notEqual(0), end)

ifNot(time.greaterThan(last), end)

operation("add", time, ticks).to(last)

const res = sensor(build("switch2"), prop("enabled")).get().opNotEqual(true)

control(build("switch2"))
    .enabled(res)