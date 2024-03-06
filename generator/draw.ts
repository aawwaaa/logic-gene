import { Var, Value, Color, draw } from "./core"

// export function bar(value: Var<number>, x: number, y: number, width: number, height: number, stroke: number, color: Value<Color>, borderColor: Value<Color> = Color.color("ffffff"), backgroundColor: Value<Color> = Color.color("000000")){
//     const w = value.toMul(width - stroke * 2)
//     draw.col(backgroundColor)
//     draw.rect(x, y, width, height)
//     draw.col(borderColor)
//     draw.stroke(stroke)
//     draw.lineRect(x, y, width, height)
//     draw.col(color)
//     draw.rect(x + stroke, y + stroke, w, height - 2 * stroke)
// }