import { forLoop, ifThen, whileLoop } from "../generator/condition"
import { build, operation, read, time, variable, wait, write } from "../generator/core"
import { generateIO } from "../generator/private/io"

const deltaAngle = 360 / 45
const repeat = 360 / deltaAngle
const maxDistance = 256
const distanceEveryBlock = 32
const distanceStep = 2
const fov = 120

const worldSize = 8

const dataCell = build("cell1")
const blocksCell = build("cell2")
const outputBank = build("bank1")

const data = generateIO(dataCell, {
    x: 0,
    y: 1,
    angle: 8,
})

const deltaT = operation("sub", 1000, time.toAdd(0).mod(1000)).get().div(1000)
wait(deltaT)

forLoop(() => variable().set(0), v => v.lessThan(repeat), v => v.add(1), v => {
    const angle = data.angle().add(360 - fov / 2).add(v.toMul(deltaAngle)).mod(360)
    const x = data.x()
    const y = data.y()
    const sin = angle.toSin()
    const cos = angle.toCos()
    const deltaX = cos.toMul(distanceStep)
    const deltaY = sin.toMul(distanceStep)
    const distance = variable().set(0)
    const block = variable().set(-1)
    whileLoop(() => distance.lessThan(maxDistance), (breaking) => {
        const tileX = x.toDiv(distanceEveryBlock).floor().max(0).min(worldSize - 1)
        const tileY = y.toDiv(distanceEveryBlock).floor().max(0).min(worldSize - 1)
        const index = tileY.toMul(worldSize).add(tileX)
        const currentBlock = read(blocksCell, index).get()
        ifThen(currentBlock.notEqual(-1), () => {
            block.set(currentBlock)
            breaking()
        })
        distance.add(distanceStep)
        x.add(deltaX)
        y.add(deltaY)
    })
    ifThen(block.equal(-1), () => {
        write(outputBank, v, -1)
    }, () => {
        write(outputBank, v, block.shl(24).add(distance))
    })

})
