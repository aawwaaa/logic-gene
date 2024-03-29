import { ifThen } from "../generator/condition";
import { block, drawflush, prop, radar, sensor, thisProcessor, unitBind, unitType } from "../generator/core";
import { charDisplay } from "../generator/private/char_display";

const display = charDisplay(16)

const unit = unitBind(unitType("mega"))

const player = unit.radar({
    "type": ["player"]
}).get()

const x = sensor(player, prop("x")).get()
const y = sensor(player, prop("y")).get()

unit.controls.move(x, y)
const {type, building} = unit.controls.getBlock(x, y).packed()

function displayLine(y: number, str: string): void{
    for(let i = 0; i < str.length; i++){
        display.displayWithoutSetColor(i*16, y, str.charCodeAt(i))
    }
}

ifThen(type.equal(block("large-logic-display")), () => {
    display.display(-16, -16, 0)
    displayLine(160, "Hello,     ")
    displayLine(144, "World!     ")
    displayLine(128, "By ZZZ     ")
    drawflush(building)
})
