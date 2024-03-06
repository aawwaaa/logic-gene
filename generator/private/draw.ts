import { doWhileLoop, ifThen, switchCounterJump, whileLoop } from "../condition";
import { Value, Var, always, counter, draw, jumpToAfter, operation, variable } from "../core";

export function bar(x: number, y: number, w: number, h: number, stroke: number, color: [number, number, number], value: Var<number>, max: Value<number>){
    const mul = value.toDiv(max)
    const wid = mul.toMul(w - stroke * 2, "wid").floor()
    
    // draw.color(255,255,255,255)
    // draw.image(5, 35, block("battery"), 8, 0)
    draw.stroke(1)
    draw.lineRect(x, y, w, h)
    draw.color(...color,255)
    draw.rect(x + stroke, y + stroke, wid, h - stroke * 2)
}

export function numberDisplay(){
    const anumber = variable(":numNumber")
    const ax = variable(":numX")
    const ay = variable(":numY")
    const ah = variable(":numH")
    const aspac = variable(":numSpac")
    const ret = variable(":numRet")
    const dighted = variable(":numDighted")
    const c = operation("add", counter, 1).get()
    const a = jumpToAfter(always)
    {
        const dights = anumber.toLog10().floor().add(1)
        ifThen(dighted.notEqual(0), () => {
            dights.set(dighted)
            dighted.set(0)
        })
        const h2 = ah.toDiv(2).floor()
        const spac = aspac.toAdd(h2)
        const x1 = ax.toSub(spac.toMul(dights))
        const x2 = x1.toAdd(h2)
        const y1 = ay.toAdd(h2)
        const y2 = ay.toAdd(ah)
        doWhileLoop(dights.greaterThan(0), () => {
            dights.sub(1)
            const pow = operation("pow", 10, dights).get()
            const dight = anumber.toDiv(pow).mod(10).floor()
            switchCounterJump(dight, [
                "1110111",
                "0010010",
                "1011101",
                "1011011",
                "0111010",
                "1101011",
                "1101111",
                "1010010",
                "1111111",
                "1111011",
            ].map(a => () => {
                if(a[0]=="1") draw.line(x1, y2, x2, y2)
                if(a[1]=="1") draw.line(x1, y2, x1, y1)
                if(a[2]=="1") draw.line(x2, y2, x2, y1)
                if(a[3]=="1") draw.line(x1, y1, x2, y1)
                if(a[4]=="1") draw.line(x1, y1, x1, ay)
                if(a[5]=="1") draw.line(x2, y1, x2, ay)
                if(a[6]=="1") draw.line(x1, ay, x2, ay)
            }))
            x1.add(spac)
            x2.add(spac)
        })
        operation("add", ret, 1).to(counter)
    }
    a.here()
    return {
        number(x: Value<number>, y: Value<number>, h: Value<number>, spac: Value<number>, num: Value<number>){
            anumber.set(num)
            ax.set(x)
            ay.set(y)
            ah.set(h)
            aspac.set(spac)
            ret.set(counter)
            counter.set(c)
        },
        dightedNumber(x: Value<number>, y: Value<number>, h: Value<number>, spac: Value<number>, dights: Value<number>, num: Value<number>){
            dighted.set(dights)
            this.number(x, y, h, spac, num)
        }
    }
}