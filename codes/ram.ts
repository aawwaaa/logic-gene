import { ifThen } from "../generator/condition";
import { build, end, prop, sensor, variable } from "../generator/core";
import { binaryPort } from "../generator/private/binary";

const data = binaryPort(0, 16)
const addressPort = binaryPort(32, 5)
const enabled = sensor(build("door37"), prop("enabled")).get()
const readEnabled = sensor(build("door38"), prop("enabled")).get()
const writeEnabled = sensor(build("door39"), prop("enabled")).get()

ifThen(enabled.equal(0), end)

ifThen(readEnabled.notEqual(0), () => {
    const value = variable().set(0)
    const address = variable()
    addressPort.read(address)
})
