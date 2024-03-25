import { switchCounterPad } from "../condition";
import { build, color, draw, drawflush, variable, jumpToAfter, Value, Color, counter, operation, always } from "../core";

export function charDisplay(size: number): {
    display(x: Value<number>, y: Value<number>, char: Value<number>, foreground?: Value<Color>, background?: Value<Color>): void
    displayWithoutSetColor(x: Value<number>, y: Value<number>, char: Value<number>): void
}{

const endMark = jumpToAfter(always)

const x = variable("::charDisplay::x")
const y = variable("::charDisplay::y")
const ret = variable("::charDisplay::ret")

const char = variable("::charDisplay::char")

const foreground = variable("::charDisplay::foreground")
const background = variable("::charDisplay::background")

const empty = () => {}

const xp = Object.fromEntries(Object.entries({
    0: 0,
    1: 0.125,
    2: 0.25,
    3: 0.375, 
    4: 0.5,
    5: 0.625,
    6: 0.75
}).map(([k, a]) => [k, a == 0? x: x.toAdd(size * a)]))
const yp = Object.fromEntries(Object.entries({
    [-1]: 0,
    0: 0.125,
    1: 0.25,
    2: 0.375,
    3: 0.5, 
    4: 0.625,
    5: 0.75,
    6: 0.875
}).map(([k, a]) => [k, a == 0? y: y.toAdd(size * a)]))

function rect(x1: number, y1: number, x2: number = x1, y2: number = y1){
    draw.rect(xp[x1], yp[y1], unit * (x2 - x1 + 1), unit * (y2 - y1 + 1))
}

const unit = size / 8

draw.col(background)
draw.rect(xp[0], yp[-1], size, size)
draw.col(foreground)

const index = char.toSub(32)
const mark = jumpToAfter(index.lessThan(0))
switchCounterPad(index, 6, [empty, 
    () => {
        // !
        rect(6, 2, 6, 6)
        rect(6, 0)
    }, () => {
        // "
        rect(0, 5, 0, 6)
        rect(2, 5, 2, 6)
    }, () => {
        // #
        rect(1, 0, 1, 6)
        rect(4, 0, 4, 6)
        rect(0, 1, 5, 1)
        rect(0, 5, 5, 5)
    }, () => {
        // $
        rect(0, 1, 6, 1)
        rect(0, 3, 6, 3)
        rect(0, 5, 6, 5)
        rect(0, 1, 0, 3)
        rect(6, 3, 6, 5)
        rect(3, 0, 3, 6)
    }, () => {
        // %
        rect(0, 4, 1, 6)
        rect(5, 0, 6, 2)
        rect(2, 0, 2, 2)
        rect(3, 3, 3, 3)
        rect(4, 4, 4, 6)
    }, () => {
        // &
        rect(0, 0, 0, 6)
        rect(0, 0, 6, 0)
        rect(0, 6, 3, 6)
        rect(0, 3, 2, 3)
        rect(6, 0, 6, 3)
    }, () => {
        // '
        rect(0, 5, 0, 6)
    }, () => {
        // <
        rect(0, 3, 0, 3)
        rect(1, 2, 1, 4)
        rect(2, 1, 2, 5)
        draw.col(background)
        rect(1, 3, 1, 3)
        rect(2, 2, 2, 4)
    }, () => {
        // >
        rect(6, 3, 6, 3)
        rect(5, 2, 5, 4)
        rect(4, 1, 4, 5)
        draw.col(background)
        rect(5, 3, 5, 3)
        rect(4, 2, 4, 4)
    }, () => {
        // *
        rect(1, 4, 1, 5)
        rect(1, 1, 1, 2)
        rect(3, 0, 3, 6)
        rect(2, 3, 4, 3)
        rect(5, 4, 5, 5)
        rect(5, 1, 5, 2)
    }, () => {
        // +
        rect(3, 1, 3, 5)
        rect(1, 3, 5, 3)
    }, () => {
        // ,
        rect(4, 0)
        rect(5, 1)
    }, () => {
        // -
        rect(1, 3, 5, 3)
    }, () => {
        // .
        rect(5, 1)
    }, () => {
        // /
        rect(2, 0, 2, 2)
        rect(3, 3)
        rect(4, 4, 4, 6)
    }, () => {
        // 0
        rect(0, 1, 0, 5)
        rect(4, 1, 4, 5)
        rect(1, 0, 3, 0)
        rect(1, 6, 3, 6)
        rect(2, 3)
    }, () => {
        // 1
        rect(0, 4)
        rect(1, 5)
        rect(2, 0, 2, 6)
        rect(0, 0, 4, 0)
    }, () => {
        // 2
        rect(0, 5)
        rect(1, 6, 3, 6)
        rect(4, 3, 4, 5)
        rect(2, 2, 3, 2)
        rect(1, 1)
        rect(0, 0, 4, 0)
    }, () => {
        // 3
        rect(0, 6, 3, 6)
        rect(0, 3, 3, 3)
        rect(0, 0, 3, 0)
        rect(4, 1, 4, 5)
    }, () => {
        // 4
        rect(0, 4, 0, 6)
        rect(1, 3, 3, 3)
        rect(4, 0, 4, 6)
    }, () => {
        // 5
        rect(0, 6, 4, 6)
        rect(0, 4, 0, 6)
        rect(1, 3, 3, 3)
        rect(4, 1, 4, 2)
        rect(0, 0, 3, 0)
    }, () => {
        // 6
        rect(1, 6, 3, 6)
        rect(0, 1, 0, 5)
        rect(1, 3, 3, 3)
        rect(4, 1, 4, 2)
        rect(1, 0, 3, 0)
    }, () => {
        // 7
        rect(0, 6, 4, 6)
        rect(3, 4, 3, 5)
        rect(2, 3)
        rect(1, 0, 1, 2)
    }, () => {
        // 8
        rect(0, 4, 4, 5)
        rect(0, 1, 4, 2)
        rect(1, 0, 3, 6)
        draw.col(background)
        rect(1, 4, 3, 5)
        rect(1, 1, 3, 2)
    }, () => {
        // 9
        rect(1, 6, 3, 6)
        rect(0, 4, 0, 5)
        rect(1, 3, 3, 3)
        rect(4, 1, 4, 5)
        rect(0, 1, 3, 0)
    }, () => {
        // :
        rect(5, 4)
        rect(5, 1)
    }, () => {
        // ;
        rect(5, 4)
        rect(5, 1)
        rect(4, 0)
    }, () => {
        // (
        rect(1, 2, 1, 4)
        rect(2, 1, 2, 5)
        rect(3, 0, 3, 6)
        draw.col(background)
        rect(2, 2, 2, 4)
        rect(3, 1, 3, 5)
    }, () => {
        // =
        rect(1, 4, 5, 4)
        rect(1, 2, 5, 2)
    }, () => {
        // )
        rect(5, 2, 5, 4)
        rect(4, 1, 4, 5)
        rect(3, 0, 3, 6)
        draw.col(background)
        rect(4, 2, 4, 4)
        rect(3, 1, 3, 5)
    }, () => {
        // ?
        rect(1, 6, 5, 6)
        rect(5, 3, 5, 6)
        rect(3, 3, 5, 3)
        rect(3, 2)
        rect(3, 0)
    }, () => {
        // @
        rect(0, 1, 0, 5)
        rect(1, 6, 4, 6)
        rect(1, 0, 5, 0)
        rect(5, 2, 5, 5)
        rect(4, 2)
        rect(2, 2, 3, 4)
    }, () => {
        // A
        rect(0, 0, 0, 4)
        rect(1, 5)
        rect(2, 6, 6, 6)
        rect(6, 0, 6, 6)
        rect(0, 3, 6, 3)
    }, () => {
        // B
        rect(0, 0, 0, 6)
        rect(0, 6, 5, 6)
        rect(0, 0, 5, 0)
        rect(6, 1, 6, 2)
        rect(6, 4, 6, 5)
        rect(2, 3, 5, 3)
    }, () => {
        // C
        rect(0, 2, 0, 4)
        rect(1, 1)
        rect(1, 5)
        rect(2, 6, 6, 6)
        rect(2, 0, 6, 0)
    }, () => {
        // D
        rect(0, 0, 0, 6)
        rect(0, 6, 4, 6)
        rect(5, 5)
        rect(5, 1)
        rect(6, 2, 6, 4)
        rect(0, 0, 4, 0)
    }, () => {
        // E
        rect(0, 1, 0, 6)
        rect(0, 6, 6, 6)
        rect(0, 3, 6, 3)
        rect(1, 0, 6, 0)
    }, () => {
        // F
        rect(0, 0, 0, 6)
        rect(0, 6, 6, 6)
        rect(2, 3, 4, 3)
    }, () => {
        // G
        rect(2, 6, 6, 6)
        rect(1, 5)
        rect(0, 1, 0, 4)
        rect(1, 0, 6, 0)
        rect(6, 0, 6, 3)
        rect(3, 3, 6, 3)
    }, () => {
        // H
        rect(0, 0, 0, 6)
        rect(6, 0, 6, 6)
        rect(0, 3, 6, 3)
    }, () => {
        // I
        rect(0, 6, 6, 6)
        rect(3, 0, 3, 6)
        rect(0, 0, 6, 0)
    }, () => {
        // J
        rect(0, 6, 6, 6)
        rect(4, 2, 4, 6)
        rect(0, 1)
        rect(3, 1)
        rect(1, 0, 2, 0)
    }, () => {
        // K
        rect(0, 0, 0, 6)
        rect(0, 3, 4, 3)
        rect(5, 2)
        rect(5, 4)
        rect(6, 0, 6, 1)
        rect(6, 5, 6, 6)
    }, () => {
        // L
        rect(0, 0, 0, 6)
        rect(0, 0, 6, 0)
    }, () => {
        // M
        rect(0, 0, 0, 6)
        rect(6, 0, 6, 6)
        rect(1, 5)
        rect(5, 5)
        rect(2, 4, 4, 4)
    }, () => {
        // N
        rect(0, 0, 0, 6)
        rect(6, 0, 6, 6)
        rect(1, 5, 2, 5)
        rect(3, 2, 3, 4)
        rect(4, 1, 5, 1)
    }, () => {
        // O
        rect(0, 1, 0, 5)
        rect(1, 0, 5, 0)
        rect(6, 1, 6, 5)
        rect(1, 6, 5, 6)
    }, () => {
        // P
        rect(1, 6, 5, 6)
        rect(0, 0, 0, 5)
        rect(0, 3, 5, 3)
        rect(6, 4, 6, 5)
    }, () => {
        // Q
        rect(1, 6, 5, 6)
        rect(0, 3, 0, 5)
        rect(6, 3, 6, 5)
        rect(1, 2, 5, 2)
        rect(4, 1)
        rect(5, 0)
    }, () => {
        // R
        rect(0, 0, 0, 6)
        rect(0, 6, 5, 6)
        rect(6, 4, 6, 5)
        rect(2, 3, 5, 3)
        rect(3, 1, 3, 2)
        rect(4, 0, 6, 0)
    }, () => {
        // S
        rect(1, 6, 6, 6)
        rect(0, 4, 0, 5)
        rect(1, 3, 5, 3)
        rect(6, 1, 6, 2)
        rect(0, 0, 5, 0)
    }, () => {
        // T
        rect(0, 6, 6, 6)
        rect(3, 0, 3, 6)
    }, () => {
        // U
        rect(0, 2, 0, 6)
        rect(1, 1)
        rect(2, 0, 5, 0)
        rect(6, 0, 6, 6)
    }, () => {
        // V
        rect(0, 2, 0, 6)
        rect(6, 2, 6, 6)
        rect(1, 1)
        rect(5, 1)
        rect(2, 0, 4, 0)
    }, () => {
        // W
        rect(0, 0, 0, 6)
        rect(6, 0, 6, 6)
        rect(1, 1)
        rect(5, 1)
        rect(2, 2, 4, 2)
    }, () => {
        // X
        rect(0, 4, 0, 6)
        rect(0, 0, 0, 2)
        rect(1, 3, 5, 3)
        rect(6, 0, 6, 2)
        rect(6, 4, 6, 6)
    }, () => {
        // Y
        rect(1, 5, 1, 6)
        rect(5, 5, 5, 6)
        rect(2, 4)
        rect(4, 4)
        rect(3, 0, 3, 3)
    }, () => {
        // Z
        rect(0, 6, 6, 6)
        rect(0, 0, 6, 0)
        rect(1, 1, 1, 2)
        rect(5, 4, 5, 5)
        rect(2, 3, 4, 3)
    }, () => {
        // [
        rect(1, 6, 3, 6)
        rect(1, 0, 1, 6)
        rect(1, 0, 3, 0)
    }, () => {
        // \\
        rect(2, 4, 2, 6)
        rect(3, 3)
        rect(4, 0, 4, 2)
    }, () => {
        // ]
        rect(3, 6, 5, 6)
        rect(5, 0, 5, 6)
        rect(3, 0, 5, 0)
    }, () => {
        // ^
        rect(1, 4)
        rect(2, 5)
        rect(3, 6)
        rect(4, 5)
        rect(5, 4)
    }, () => {
        // _
        rect(1, 0, 5, 0)
    }, () => {
        // `
        rect(0, 6)
        rect(1, 5, 2, 5)
    }, () => {
        // a
        rect(1, 4, 3, 4)
        rect(4, 1, 4, 3)
        rect(1, 0, 3, 0)
        rect(0, 1)
        rect(1, 2, 3, 2)
    }, () => {
        // b
        rect(0, 1, 0, 4)
        rect(1, 0, 3, 0)
        rect(4, 1)
        rect(2, 2, 3, 2)
    }, () => {
        // c
        rect(0, 1, 0, 3)
        rect(1, 4, 4, 4)
        rect(1, 0, 4, 0)
    }, () => {
        // d
        rect(4, 1, 4, 4)
        rect(1, 0, 3, 0)
        rect(0, 1)
        rect(1, 2, 2, 2)
    }, () => {
        // e
        rect(1, 4, 3, 4)
        rect(0, 1, 0, 3)
        rect(1, 0, 3, 0)
        rect(4, 3)
        rect(2, 2, 3, 2)
    }, () => {
        // f
        rect(0, 0, 0, 3)
        rect(1, 4, 4, 4)
        rect(2, 2, 3, 2)
    }, () => {
        // g
        rect(0, 3)
        rect(1, 4, 3, 4)
        rect(4, 1, 4, 3)
        rect(1, 2, 2, 2)
        rect(2, 0, 3, 0)
    }, () => {
        // h
        rect(0, 0, 0, 4)
        rect(2, 2, 3, 2)
        rect(4, 0, 4, 1)
    }, () => {
        // i
        rect(2, 4)
        rect(2, 0, 2, 2)
    }, () => {
        // j
        rect(2, 4)
        rect(2, 1, 2, 2)
        rect(0, 0, 1, 0)
    }, () => {
        // k
        rect(0, 0, 0, 4)
        rect(1, 2, 2, 2)
        rect(3, 1)
        rect(3, 3)
        rect(4, 0)
        rect(4, 4)
    }, () => {
        // l
        rect(0, 1, 0, 4)
        rect(1, 0, 2, 0)
    }, () => {
        // m
        rect(1, 4)
        rect(3, 4)
        rect(0, 0, 0, 3)
        rect(2, 0, 2, 3)
        rect(4, 0, 4, 3)
    }, () => {
        // n
        rect(0, 0, 0, 4)
        rect(1, 4)
        rect(2, 0, 2, 3)
    }, () => {
        // o
        rect(0, 1, 0, 3)
        rect(1, 4, 3, 4)
        rect(1, 0, 3, 0)
        rect(4, 1, 4, 3)
    }, () => {
        // p
        rect(0, 0, 0, 3)
        rect(1, 4, 3, 4)
        rect(4, 3)
        rect(2, 2, 3, 2)
    }, () => {
        // q
        rect(1, 4, 3, 4)
        rect(4, 0, 4, 3)
        rect(0, 3)
        rect(1, 2, 2, 2)
    }, () => {
        // r
        rect(1, 4, 2, 4)
        rect(0, 0, 0, 3)
    }, () => {
        // s
        rect(1, 4, 3, 4)
        rect(0, 3)
        rect(1, 2, 3, 2)
        rect(4, 1)
        rect(0, 0, 3, 0)
    }, () => {
        // t
        rect(0, 3, 2, 3)
        rect(1, 0, 1, 4)
    }, () => {
        // u
        rect(0, 2, 0, 4)
        rect(1, 1)
        rect(2, 0, 4, 0)
        rect(4, 0, 4, 4)
    }, () => {
        // v
        rect(0, 2, 0, 4)
        rect(4, 2, 4, 4)
        rect(1, 1)
        rect(3, 1)
        rect(2, 0)
    }, () => {
        // w
        rect(0, 1, 0, 4)
        rect(2, 1, 2, 4)
        rect(4, 1, 4, 4)
        rect(1, 0)
        rect(3, 0)
    }, () => {
        // x
        rect(0, 0, 0, 1)
        rect(0, 3, 0, 4)
        rect(1, 2)
        rect(2, 0, 2, 1)
        rect(2, 3, 2, 4)
    }, () => {
        // y
        rect(0, 3, 0, 4)
        rect(1, 2)
        rect(1, 0, 2, 0)
        rect(3, 1, 3, 4)
    }, () => {
        // z
        rect(0, 4, 4, 4)
        rect(0, 0, 4, 0)
        rect(1, 1)
        rect(2, 2)
        rect(3, 3)
    }, () => {
        // {
        rect(1, 3)
        rect(2, 0, 2, 6)
        rect(3, 6)
        rect(3, 0)
    }, () => {
        // |
        rect(3, 0, 3, 6)
    }, () => {
        // }
        rect(5, 3)
        rect(4, 0, 4, 6)
        rect(3, 6)
        rect(3, 0)
    }, () => {
        // ~
        rect(0, 3, 0, 4)
        rect(1, 5, 2, 5)
        rect(3, 2, 3, 4)
        rect(4, 1, 5, 1)
        rect(6, 2, 6, 3)
    }, () => {
        // ^?
        rect(0, 5, 2, 5)
        rect(4, 6, 6, 6)
        rect(6, 5)
        rect(5, 4, 6, 4)
        rect(5, 2)
    }
])
mark.here()

operation("add", ret, 1).to(counter)
endMark.here()

return {
    display(ax: Value<number>, ay: Value<number>, achar: Value<number>, aforeground: Value<Color> = color("ffffffff"), abackground: Value<Color> = color("000000ff")): void{
        x.set(ax)
        y.set(ay)
        char.set(achar)
        foreground.set(aforeground)
        background.set(abackground)
        ret.set(counter)
        counter.set(endMark.line.lineNumber + 1)
    },
    displayWithoutSetColor(ax: Value<number>, ay: Value<number>, achar: Value<number>): void{
        x.set(ax)
        y.set(ay)
        char.set(achar)
        ret.set(counter)
        counter.set(endMark.line.lineNumber + 1)
    }
}

}
