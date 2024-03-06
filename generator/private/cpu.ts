import { ifNot } from "../condition";
import { Line, always, prop, sensor } from "../core";

export function waitForHigh(clock, doing = () => {}){
    const line = sensor(clock, prop("enabled"))
    doing()
    line.jump(line.get(":clock").notEqual(true))
}

export function waitForLow(clock, doing = () => {}){
    const line = sensor(clock, prop("enabled"))
    doing()
    line.jump(line.get(":clock").notEqual(false))
}

export function waitForToggle(clock, doing = () => {}){
    const clk = sensor(clock, prop("enabled")).get(":clock2")
    const line = sensor(clock, prop("enabled"))
    doing()
    line.jump(line.get(":clock").equal(clk))
}

export function waitCommands(len: number = 3){
    for(let i = 0; i < len; i++){
        new Line("set 0 0")
    }
}