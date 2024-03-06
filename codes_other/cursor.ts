import { doWhileLoop, ifNot } from "../generator/condition";
import { build, draw, drawflush, end, prop, sensor } from "../generator/core";
import { generateIO } from "../generator/private/io";
import { getTouchPos } from "../generator/private/touch";

const ioCell = build("cell1")
const io = generateIO(ioCell, {
    offX: 0,
    offY: 1,

    viewX: 2,
    viewY: 3,
    scale: 4,

    size: 8
})

const turret = build("arc1")
const display = build("display1")
const [sx, sy, si] = getTouchPos(turret, display)
ifNot(si.notEqual(0), end)

doWhileLoop(si.notEqual(0), () => {
    const [sx2, sy2, si2] = getTouchPos(turret, display)
    si.set(si2)
    sx.sub(sx2)
    sy.sub(sy2)
    
    draw.line(87, 87, sx.toAdd(87), sy.toAdd(87))
    drawflush(display)
    
    const size = io.size()
    
    sx.div(size)
    sy.div(size)
    
    const vx = io.viewX().add(sx).min(96).max(0)
    const vy = io.viewY().add(sy).min(96).max(0)
    
    io.viewX(vx)
    io.viewY(vy)

    sx.set(sx2)
    sy.set(sy2)
})
