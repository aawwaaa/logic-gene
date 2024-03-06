import { doWhileLoop, forLoop, ifNot, ifThen, switchCounter, switchCounterJump, waitState, whileLoop } from "../generator/condition";
import { Condition, SingleResult, Value, Var, always, build, control, end, getlink, jumpToAfter, operation, print, printflush, prop, read, sensor, set, time, variable, wait, write } from "../generator/core";
import { waitForLow, waitForHigh, waitCommands, waitForToggle } from "../generator/private/cpu";
import { commands, operations, operations as ops, registers as regi } from "../cpu/consts";

const clock = build("switch1")
const reset = build("switch2")

const registers = build("cell1")
const int = build("cell2")
const components = build("bank1")

const bankBegin = 6

const reg = (function(){
    function reg(index, name){
        const v = variable("!"+name)
        return function(value?: Value<number>): Var<number>{
            if(value != void 0){
                write(registers, index, value)
                return v
            }
            read(registers, index).to(v)
            return v
        }
    }

    const obj = {}
    Object.entries(regi).forEach(([key, value]) => {
        obj[key] = reg(value, key)
    })
    return obj as {[K in keyof typeof regi]: (value?: Value<number>) => Var<number>}
})()

function crossBankRead(addr: Var<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return read(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"))
}

function crossBankWrite(addr: Var<number>, data: Value<number>){
    const bank = addr.toDiv(512, "bank").floor().add(bankBegin)
    return write(getlink(bank).get("bank"), addr.toMod(512, "bankAddr"), data)
}

function readMem(address: Var<number>){
    const result = crossBankRead(address)
    waitForToggle(clock)
    return result
}

function writeMem(address: Var<number>, value: Value<number>, wait = true){
    crossBankWrite(address, value)
    if(wait) waitForToggle(clock)
}

function push(value: Value<number>, wait = true){
    const sp = reg.sp()
    writeMem(sp, value, false)
    // log("push "+sp+" "+value)
    reg.sp(sp.add(1))
    if(wait) waitForToggle(clock)
}

function pop(): SingleResult<number>{
    const sp = reg.sp()
    reg.sp(sp.sub(1))
    // ifNot(sp.greaterThan(reg.locals()), () => {
    //     control(reset).enabled(true)
    //     end()
    // })
    // log("pop "+sp)
    return readMem(sp)
}

function log(text: string){
    print(text)
    printflush(build("message1"))
}

function next(ready = true){
    waitForLow(clock)
    const pc = reg.pc()
    const result = crossBankRead(pc)
    reg.pc(pc.add(1))
    if(ready){
        waitForToggle(clock)
        result.to(command)
        end()
    }
}

const reseting = sensor(reset, prop("enabled")).get("reseting")
let mark
ifNot(reseting.equal(0), () => {
    doWhileLoop(reseting.notEqual(0), () => {
        sensor(reset, prop("enabled")).to(reseting)
    })
    const vals = {
        pc: 512,
        sp: 64
    }
    Object.keys(reg).map(a => {
        reg[a](vals[a] ?? 0)
    })
    write(int, 0, 0)
    mark = jumpToAfter(always)
})

const commandBins = 8
const symbolBin = 51 - commandBins

const command = variable("command")

const intType = read(int, 0).get("int")
ifNot(intType.lessThanEq(0), () => {
    const loaded = read(int, 1).get("intLoaded")
    ifNot(loaded.notEqual(0), () => {
        const len = read(int, 2).get("intLen")
        push(intType)
        forLoop(() => variable("i").set(0), v => v.lessThan(len), v => v.add(1), v => {
            const value = read(int, v.toAdd(3)).get("value")
            push(value)
        })
        // log("intLen ---> "+len)
        push(len.add(1))
    })
    // log("int "+intType)
    reg.pc(reg.pc().sub(1))
    command.set(commands.call)
    command.or(reg.intproc().shl(commandBins))
    write(int, 0, -1)
})

const data = command.toShr(commandBins, "data")
const sym = data.toShr(symbolBin, "symbol")
data.and(Math.pow(2, symbolBin) - 1)
ifNot(sym.equal(0), () => operation("sub", 0, data).to(data))
command.and(Math.pow(2, commandBins) - 1)

reg.command(command)
reg.commandData(data)

const value = variable("value")
const value2 = variable("value2")
const value3 = variable("value3")
switchCounterJump(command, [() => {
    // reset
    control(reset).enabled(true)
}, () => {
    // greg
    read(registers, data).to(value)
    push(value, false)
    // log("greg "+data+" ---> "+value)
}, () => {
    // sreg
    const sp = reg.sp()
    reg.sp(sp.sub(1))
    readMem(sp).to(value)
    write(registers, data, value)
    // log("sreg "+data+" "+value)
}, () => {
    // const
    push(data)
    // log("const ---> "+data)
}, () => {
    // op
    pop().to(value2)
    pop().to(value)
    switchCounter(data, 1, Object.entries(operations).map(([key, v]) => v == 1? null: () => {
        operation(key as any, value, value2).to(value3)
    }).filter(a => a))
    push(value3)
    // log("op "+value+" "+value2+" --"+data+"-> "+value3)
}, () => {
    // opa
    pop().to(value)
    switchCounter(data, 1, Object.entries(operations).map(([key, v]) => v == 2? null: () => {
        operation(key as any, value).to(value3)
    }).filter(a => a))
    push(value3)
    // log("opa "+value+" --"+data+"-> "+value3)
}, () => {
    // addi
    const sp = reg.sp()
    reg.sp(sp.sub(1))
    readMem(sp).to(value)
    operation("add", value, data).to(value3)
    push(value3)
    // log("addi "+value+" "+data+" ---> "+value3)
}, () => {
    // cpy
    pop().to(value)
    push(value)
    push(value)
    // log("cpy "+value)
}, () => {
    // jmp
    pop().to(value2)
    pop().to(value)
    const jumps = []
    switchCounter(data, 1, ["always", "equal", "notEqual", "lessThan", "lessThanEq", "greaterThan", "greaterThanEq"].map(a => () => {
        jumps.push(jumpToAfter(new Condition(value.name, value2.name, a)))
    }))
    const j = jumpToAfter(always)
    jumps.forEach(j => j.here())
    const addr = reg.address()
    reg.pc(addr)
    j.here()
    // log("jmp "+value+" "+value2+" "+data+" ---> "+addr)
}, () => {
    // jmpi
    reg.pc(data)
    // log("jmpi ---> "+data)
}, () => {
    // jeqi
    pop().to(value)
    ifNot(value.notEqual(0), () => {
        reg.pc(data)
    })
    // log("jeqi "+value+" ---> "+data)
}, () => {
    // jnei
    pop().to(value)
    ifNot(value.equal(0), () => {
        reg.pc(data)
    })
    // log("jnei "+value+" ---> "+data)
}, () => {
    // read
    const address = reg.address()
    readMem(address).to(value)
    push(value)
    // log("read "+address+" ---> "+value)
}, () => {
    // write
    const address = reg.address()
    pop().to(value)
    writeMem(address, value)
    // log("write "+address+" "+value)
}, () => {
    // reads
    readMem(data).to(value)
    push(value)
    // log("reads "+data+" ---> "+value)
}, () => {
    // writes
    pop().to(value)
    writeMem(data, value)
    // log("writes "+data+" "+value)
}, () => {
    // loop
    const loop = reg.loop()
    ifNot(loop.lessThanEq(0), () => {
        reg.pc(data)
        reg.loop(loop.sub(1))
    })
    // log("loop "+loop+" ---> "+data)
}, () => {
    // call
    pop().to(value)
    read(int, 0).to(value2)
    push(value2)
    ifThen(value2.equal(-1), () => {
        write(int, 0, -2)
    }, () => {
        write(int, 0, 0)
    })
    const locals = reg.locals()
    const args = reg.args()
    const pc = reg.pc()
    push(locals)
    push(args)
    push(pc)
    reg.pc(data)
    reg.args(reg.sp().sub(4).sub(value))
    // log("call "+locals+" "+args+" "+pc+" "+value2+" "+value+" ---> "+data)
}, () => {
    // ret
    pop().to(value)
    // print("retval "+value)
    reg.retval(value)
    const loc = reg.locals()
    // print(" loc-sp "+loc)
    reg.sp(loc)
    let rsp = reg.sp()
    reg.sp(rsp.sub(1))
    const pc = readMem(rsp).get()
    // print(" pc "+pc)
    reg.pc(pc)
    pop().to(value)
    // print(" args "+value)
    rsp = reg.sp()
    reg.sp(rsp.sub(1))
    const locals = readMem(rsp).get()
    // print(" locals "+locals)
    reg.locals(locals)
    rsp = reg.sp()
    reg.sp(rsp.sub(1))
    readMem(rsp).to(value2)
    // print(" int "+value2)
    const sp = reg.args()
    // print(" sp "+sp+"\n")
    reg.sp(sp)
    reg.args(value)

    const retval = reg.retval()
    read(int, 0).to(intType)
    ifThen(intType.notEqual(0), () => {
        const intLoaded = read(int, 1).get("intLoaded")
        // log("ret-int "+loc+" "+locals+" "+value+" "+pc+" "+value2+" "+intLoaded+" ---> "+retval)
        ifThen(intLoaded.equal(0), () => {
            write(int, 2, -1)
            write(int, 3, retval)
        }, () => {
            write(int, 1, 0)
            push(retval)
        })
        write(int, 0, 0)
    }, () => {
        push(retval)
        write(int, 0, value2)
        // log("ret "+locals+" "+value+" "+pc+" "+value2+" ---> "+retval)
    })
}, () => {
    // loadLocal
    readMem(reg.locals().add(data)).to(value)
    push(value)
    // log("readLocal "+data+" ---> "+value)
}, () => {
    // saveLocal
    pop().to(value)
    writeMem(reg.locals().add(data), value)
    // log("writeLocal "+data+" "+value)
}, () => {
    // loadArg
    readMem(reg.args().add(data)).to(value)
    push(value)
    // log("loadArg "+data+" ---> "+value)
}, () => {
    // int
    write(int, 0, data)
    write(int, 1, 1)
    pop().to(value)
    write(int, 1, value)
    forLoop(() => variable("i").set(0), v => v.lessThan(value), v => v.add(1), v => {
        pop().to(value2)
        write(int, v.toAdd(2), value2)
    })
    // log("int "+data+" "+value)
}, () => {
    // halt
    control(reset).enabled(true)
    doWhileLoop(reseting.notEqual(0), (breaking) => {
        // log("halt")
        sensor(reset, prop("enabled")).to(reseting)
        read(int, 0).to(intType)
        ifNot(intType.lessThanEq(0), () => {
            reg.sp(reg.sp().add(1))
            breaking()
        })
    })
    control(reset).enabled(false)
}, () => {
    // in
    const addr = reg.address()
    read(components, addr).to(value)
    push(value)
    // log("in "+addr+" ---> "+value)
}, () => {
    // out
    const addr = reg.address()
    pop().to(value)
    write(components, addr, value)
    // log("out "+addr+" "+value)
}, () => {
    // ini
    const addr = data
    read(components, addr).to(value)
    push(value)
    // log("in "+addr+" ---> "+value)
}, () => {
    // outi
    const addr = data
    pop().to(value)
    write(components, addr, value)
    // log("out "+addr+" "+value)
}])
mark.here()
next()