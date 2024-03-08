import { commands, cpuRegisters, ops1Cmds, ops2Cmds } from "../cpu/constants";
import { forLoop, ifNot, ifThen, switchCounter, switchCounterJump } from "../generator/condition";
import { Var, always, build, end, getlink, operation, print, printflush, read, variable, write } from "../generator/core";
import { generateIO } from "../generator/private/io";

const registerCell = build("cell1")
const memoryBegin = 2;

function readMemory(address: Var<number>): Var<number>{
    const bankID = address.toDiv(512, "bankID").floor().add(memoryBegin)
    const bank = getlink(bankID).get("bank")
    return read(bank, address.toMod(512, "localAddress")).get()
}

function writeMemory(address: Var<number>, value: Var<number>): void{
    const bankID = address.toDiv(512, "bankID").floor().add(memoryBegin)
    const bank = getlink(bankID).get("bank")
    write(bank, address.toMod(512, "localAddress"), value)
}

const registers = generateIO(registerCell, cpuRegisters)

ifNot(registers.enable().notEqual(0), () => {
    registers.pc(read(build("bank1"), 511).get())
    registers.sp(256)
    registers.intTable(128)
    registers.args(256)
    registers.locals(256)
    registers.intCall(0)
    end()
})

ifNot(registers.intCall().equal(0), () => {
    registers.intCall(0)
    const type = registers.intCallType()
    const address = readMemory(type.toAdd(registers.intTable()))
    const sp = registers.sp()
    const pc = registers.pc()
    ifThen(readMemory(pc).toAnd(0x3f).equal(commands.indexOf("halt")), () => {
        pc.add(1)
    })
    writeMemory(sp, sp)
    writeMemory(sp.add(1), pc)
    writeMemory(sp.add(1), registers.args())
    writeMemory(sp.add(1), registers.locals())
    registers.sp(sp.add(1))
    registers.pc(address)
    registers.args(sp.toSub(4))
    end()
})

const instruction = readMemory(registers.pc())
const sym = instruction.toOpLessThan(0)
instruction.abs()
const constValue = instruction.toShr(12 + 6)
ifNot(sym.equal(0), () => {
    constValue.mul(-1)
})
registers.const(constValue)
instruction.abs()
const arg1Reg = instruction.toAnd(0xf << 14, "arg1Reg").shr(14)
const arg2Reg = () => instruction.toAnd(0xf << 10, "arg2Reg").shr(10)
const resultReg = instruction.toAnd(0xf << 6, "resultReg").shr(6)
const command = instruction.toAnd(0x3f, "command")

const movSources = [() => {
    // [reg+const]
    const fromAddress = read(registerCell, arg1Reg).get("fromAddress")
    return readMemory(fromAddress.add(constValue))
}, () => {
    // [const]
    return readMemory(constValue)
}, () => {
    // [reg]
    const fromAddress = read(registerCell, arg1Reg).get("fromAddress")
    return readMemory(fromAddress)
}, () => {
    // reg
    return read(registerCell, arg1Reg).get("data")
}]
const movTargets = [(data: Var<number>) => {
    // [reg+const]
    const toAddress = read(registerCell, resultReg).get("toAddress")
    writeMemory(toAddress.add(constValue), data)
}, (data: Var<number>) => {
    // [const]
    writeMemory(constValue, data)
}, (data: Var<number>) => {
    // [reg]
    const toAddress = read(registerCell, resultReg).get("toAddress")
    writeMemory(toAddress, data)
}, (data: Var<number>) => {
    // reg
    write(registerCell, resultReg, data)
}]
const movCommands = movSources.map(source =>
    movTargets.map(target => () => {
        const data = source()
        target(data)
    })
).flat()

const ops2Commands = ops2Cmds.map(name => () => {
    const value1 = read(registerCell, arg1Reg).get("value1")
    const value2 = read(registerCell, arg2Reg()).get("value2")
    const result = operation(name as any, value1, value2).get("result")
    write(registerCell, resultReg, result)
})
const jumpConditions = [(value: Var<number>) => {
    return always
}, (value: Var<number>) => {
    return value.equal(0)
}, (value: Var<number>) => {
    return value.notEqual(0)
}, (value: Var<number>) => {
    return value.greaterThan(0)
}, (value: Var<number>) => {
    return value.greaterThanEq(0)
}, (value: Var<number>) => {
    return value.lessThan(0)
}, (value: Var<number>) => {
    return value.lessThanEq(0)
}]
const jumpCommands = jumpConditions.map((condition) => () => {
    const value = read(registerCell, arg1Reg).get("value")
    const target = read(registerCell, resultReg).get("target")
    ifThen(condition(value), () => {
        registers.pc(target)
        end()
    })
})

switchCounterJump(command, [() => {
    // reset
    registers.error(-1)
    registers.enable(0)
    registers.sp(256)
    registers.intTable(128)
}, ...movCommands, ...ops2Commands, () => {
    // ops1
    const value = read(registerCell, arg1Reg).get("value")
    const op = read(registerCell, arg2Reg()).get("op")
    switchCounter(op, 1, [...ops1Cmds.map(name => () => {
        operation(name as any, value).to(value)
    })])
    write(registerCell, resultReg, value)
}, () => {
    // push
    const value = read(registerCell, arg1Reg).get("value")
    const sp = registers.sp()
    writeMemory(sp, value)
    registers.sp(sp.add(1))
}, () => {
    // pop
    const sp = registers.sp().sub(1)
    const data = readMemory(sp)
    write(registerCell, resultReg, data)
    registers.sp(sp)
}, ...jumpCommands, () => {
    // loop
    const value = read(registerCell, arg1Reg).get("value")
    const target = read(registerCell, resultReg).get("target")
    value.sub(1)
    ifThen(value.greaterThan(0), () => {
        write(registerCell, arg1Reg, value)
        registers.pc(target)
        end()
    })
}, () => {
    // call
    const target = read(registerCell, resultReg).get("target")
    const sp = registers.sp()
    const argsBegin = sp.toSub(arg1Reg)
    writeMemory(sp, argsBegin)
    writeMemory(sp.add(1), registers.pc().toAdd(1))
    writeMemory(sp.add(1), registers.args())
    writeMemory(sp.add(1), registers.locals())
    registers.sp(sp.add(1))
    registers.pc(target)
    registers.args(argsBegin)
    end()
}, () => {
    // funcinit
    const locals = read(registerCell, arg1Reg).get("locals")
    const sp = registers.sp()
    registers.locals(sp)
    registers.sp(sp.add(locals))
}, () => {
    // ret
    const ret = read(registerCell, arg1Reg).get("ret")
    const sp = registers.locals().sub(1)
    const locals = readMemory(sp)
    const args = readMemory(sp.sub(1))
    const pc = readMemory(sp.sub(1))
    const newSp = readMemory(sp.sub(1))
    registers.locals(locals)
    registers.args(args)
    registers.pc(pc)
    registers.sp(newSp)
    registers.temp2(ret)
    end()
}, () => {
    // pushregs
    const sp = registers.sp()
    for(let i = 0; i < 8; i++){
        writeMemory(sp, read(registerCell, i).get("reg"))
        sp.add(1)
    }
    registers.sp(sp)
}, () => {
    // popregs
    const sp = registers.sp().sub(8)
    for(let i = 0; i < 8; i++){
        write(registerCell, i, readMemory(sp.toAdd(i)))
    }
    registers.sp(sp)
}, () => {
    // int
    const value = read(registerCell, arg1Reg).get("int")
    registers.intCallType(value)
    registers.intCall(1)
}, () => {
    // halt
    end()
}, () => {
    // raise
    const value = read(registerCell, arg1Reg).get("error")
    registers.error(value)
    registers.enable(0)
    end()
}, () => {
    // setlocal
    const local = resultReg
    const value = read(registerCell, arg1Reg).get("value")
    writeMemory(registers.locals().add(local), value)
}, () => {
    // memcopy
    const from = read(registerCell, arg1Reg).get("fromAddress")
    const length = read(registerCell, arg2Reg()).get("length")
    const to = read(registerCell, resultReg).get("toAddress")
    forLoop(() => variable().set(0), v => v.lessThan(length), v => v.add(1), v => {
        const data = readMemory(from.toAdd(v))
        writeMemory(to.toAdd(v), data)
    })
}, () => {
    // print
    const data = read(registerCell, arg1Reg).get("data")
    print(registers.pc() + " -> ")
    print(data)
    printflush(build("message1"))
    write(registerCell, 56, data)
    write(registerCell, 57, registers.pc())
    write(registerCell, 58, 1)
}])

registers.pc(registers.pc().add(1))
