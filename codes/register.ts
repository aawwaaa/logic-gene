import { ifThen } from "../generator/condition";
import { build, prop, sensor, variable } from "../generator/core";
import { binaryPort } from "../generator/private/binary";

const port = binaryPort(0, 16)
const data = binaryPort(16, 16)
const readEnabled = sensor(build("door33"), prop("enabled")).get()
const writeEnabled = sensor(build("door34"), prop("enabled")).get()

ifThen(readEnabled.notEqual(0), () => {
    const value = variable()
    data.read(value)
    port.write(value)
})

ifThen(writeEnabled.notEqual(0), () => {
    const value = variable()
    port.read(value)
    data.write(value)
})
