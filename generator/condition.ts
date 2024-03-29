import { Condition, jumpToAfter, always, Line, previusLine, Var, variable, operation, counter, SingleResult, getValue, SingleResultArr, Value, Building, read } from "./core"

export function ifThen(cond: Condition, then: ()=>void, elses?: ()=>void){
    const p1 = jumpToAfter(cond)
    const p2 = jumpToAfter(always)
    p1.here()
    then()
    const p3 = elses? jumpToAfter(always): null
    p2.here()
    elses?.()
    p3?.here()
    return p1.line
}

export function ifNot(cond: Condition, then: ()=>void){
    const p1 = jumpToAfter(cond)
    then()
    p1.here()
    return p1.line
}

export function whileLoop(cond: Condition | (()=>Condition), body: (breaking: ()=>Line)=>void){
    const jumps: {here(): void}[] = []
    const p1 = jumpToAfter(always)
    body(()=>{
        const i = jumpToAfter(always)
        jumps.push(i)
        return i.line
    })
    const line = p1.line.next() ?? new Line("set _ _")
    p1.here()
    line.jump(cond instanceof Condition? cond: cond())
    jumps.map(a=>a.here())
    return p1.line
}

export function doWhileLoop(cond: Condition | (()=>Condition), body: (breaking: ()=>Line)=>void){
    const jumps: {here(): void}[] = []
    const line1 = previusLine()
    body(()=>{
        const i = jumpToAfter(always)
        jumps.push(i)
        return i.line
    })
    const line = line1.next() ?? new Line("set _ _")
    line.jump(cond instanceof Condition? cond: cond())
    jumps.map(a=>a.here())
    return line
}

export function forLoop<A>(init: ()=>A, cond: Condition | ((v: A)=>Condition), update: (v: A)=>void, body: (v: A, breaking: ()=>Line)=>void){
    const line = previusLine()
    const v = init()
    whileLoop(cond instanceof Condition? cond: () => cond(v), (breaking) => {
        body(v, breaking)
        update(v)
    })
    return line.next()
}

export function switchSplit(value: Var<number>, lines: (()=>void)[]){
    const jumps = []
    function fork(begin: number, end: number){
        const middle = Math.floor((end - begin) / 2 + begin)
        if(middle == begin){
            const line = previusLine()
            lines[begin]()
            jumps.push(jumpToAfter(always))
            return line.next()
        }
        const line = ifNot(value.lessThan(middle), () => {
            fork(middle, end)
        })
        fork(begin, middle)
        return line
    }
    const line = fork(0, lines.length)
    jumps.forEach(a => a.here())
    return line
}

export function switchCounter(value: Var<number>, length: number, lines: (()=>void)[], noJump = false){
    const jumps = []
    let line;
    if(noJump){
        line = operation("add", counter, value).to(counter)
    }else{
        const temp = variable()
        line = operation("mul", value, length + 1).to(temp)
        counter.add(temp)
    }
    lines.forEach(a => {
        a()
        if(!noJump) jumps.push(jumpToAfter(always))
    })
    jumps.forEach(a => a.here())
    return line
}

export function switchCounterPad(value: Var<number>, length: number, lines: (()=>void)[], noJump = false){
    const jumps = []
    let line;
    if(noJump){
        line = operation("add", counter, value).to(counter)
    }else{
        const temp = variable()
        line = operation("mul", value, length + 1).to(temp)
        counter.add(temp)
    }
    lines.forEach((a, index) => {
        const begin = Line.getLength()
        a()
        let delta = Line.getLength() - begin
        if(delta > length){
            console.log("delta > length: " + index)
        }
        delta = length - delta
        while(delta > 0){
            new Line("set _ _");
            delta--
        }
        if(!noJump) jumps.push(jumpToAfter(always))
    })
    jumps.forEach(a => a.here())
    return line
}

export function switchValue<T>(value: Var<number>, values: T[]): SingleResult<T>{
    const results = []
    switchCounter(value, 1, values.map(a => ()=>{
        results.push(new SingleResult("set $ "+getValue(a)))
    }))
    return new SingleResultArr(results)
}

export function switchCounterJump(value: Var<number>, lines: (()=>void)[]){
    const jumpsTo = []
    const jumps = []
    const line = switchCounter(value, 1, lines.map(a => () => {
        const jump = jumpToAfter(always)
        jumpsTo.push(jump)
    }), true)
    lines.map(a => {
        jumpsTo.shift().here()
        a()
        jumps.push(jumpToAfter(always))
    })
    jumps.forEach(a => a.here())
    return line
}

export function init(body: ()=>void){
    const inited = variable()
    return ifThen(inited.notEqual(true), () => {
        body()
        inited.set(true)
    }).next()
}

export function waitState(cell: Value<Building>, addr: Value<number>, targetValue: Value<number>){
    const i = variable(":state")
    doWhileLoop(()=>i.notEqual(targetValue), ()=>read(cell, addr).to(i))
}

export function waitStateNe(cell: Value<Building>, addr: Value<number>, defValue: Value<number>){
    const i = variable(":state")
    doWhileLoop(()=>i.equal(defValue), ()=>read(cell, addr).to(i))
}
