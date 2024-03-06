import { build, variable } from "../generator/core";
import { generateIO } from "../generator/private/io";

const globals = generateIO(build("cell1"), {
    enable: 8,
    offset: 10,
    scale: 11,
    bias: 12,
    timeScale: 13,
    standardTime: 14
})

const channelIO = generateIO(build("cell2"), {
    beginTime: 0,
    bankIndex: 1,
    banks: 2,
    enable: 8,
    y: 9,
    offset: 10,
    scale: 11,
    bias: 12,
    timeScale: 13,
    standardTime: 14
})

const channelID = variable().set(0)