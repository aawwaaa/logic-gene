import { ifThen } from "../generator/condition";
import { build, control, end, prop, read, sensor } from "../generator/core";
import { generateIO } from "../generator/private/io";

const dataCell = build("cell1")
const blocksCell = build("cell2")

const worldSize = 8
const blockSize = 32

const deltaAngle = 15
const deltaDistance = blockSize / 2

const data = generateIO(dataCell, {
    x: 0,
    y: 1,
    angle: 8,
})

const leftButton = build("switch1")
ifThen(sensor(leftButton, prop("enabled")).get().notEqual(0), () => {
    data.angle(data.angle().toAdd(deltaAngle).mod(360))
    control(leftButton).enabled(0)
})

const rightButton = build("switch2")
ifThen(sensor(rightButton, prop("enabled")).get().notEqual(0), () => {
    data.angle(data.angle().toAdd(360 - deltaAngle).mod(360))
    control(rightButton).enabled(0)
})

const forwardButton = build("switch3")
ifThen(sensor(forwardButton, prop("enabled")).get().notEqual(0), () => {
    control(forwardButton).enabled(0)
    const angle = data.angle()
    const sin = angle.toSin()
    const cos = angle.toCos()
    const deltaX = cos.toMul(deltaDistance)
    const deltaY = sin.toMul(deltaDistance)
    const resultX = data.x().toAdd(deltaX)
    const resultY = data.y().toAdd(deltaY)
    const tileX = resultX.toDiv(blockSize).floor()
    const tileY = resultY.toDiv(blockSize).floor()
    ifThen(tileX.lessThan(0), end)
    ifThen(tileX.greaterThan(worldSize - 1), end)
    ifThen(tileY.lessThan(0), end)
    ifThen(tileY.greaterThan(worldSize - 1), end)
    const index = tileY.toMul(worldSize).add(tileX)
    const block = read(blocksCell, index).get()
    ifThen(block.notEqual(-1), end)
    data.x(resultX)
    data.y(resultY)
})


const backButton = build("switch4")
ifThen(sensor(backButton, prop("enabled")).get().notEqual(0), () => {
    control(backButton).enabled(0)
    const angle = data.angle()
    const sin = angle.toSin()
    const cos = angle.toCos()
    const deltaX = cos.toMul(- deltaDistance)
    const deltaY = sin.toMul(- deltaDistance)
    const resultX = data.x().toAdd(deltaX)
    const resultY = data.y().toAdd(deltaY)
    const tileX = resultX.toDiv(blockSize).floor()
    const tileY = resultY.toDiv(blockSize).floor()
    ifThen(tileX.lessThan(0), end)
    ifThen(tileX.greaterThan(worldSize - 1), end)
    ifThen(tileY.lessThan(0), end)
    ifThen(tileY.greaterThan(worldSize - 1), end)
    const index = tileY.toMul(worldSize).add(tileX)
    const block = read(blocksCell, index).get()
    ifThen(block.notEqual(-1), end)
    data.x(resultX)
    data.y(resultY)
})
