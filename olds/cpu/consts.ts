import { decodeData } from "./processor"

export const registers = {
    pc: 0,
    sp: 1,
    args: 2,
    locals: 3,
    int: 4,
    address: 8,
    loop: 9,
    retval: 10,
    intproc: 32,
    command: 62,
    commandData: 63
}

export const operations = {
    add: 2,
    sub: 2,
    mul: 2,
    div: 2,
    mod: 2,
    pow: 2,
    equal: 2,
    notEqual: 2,
    lessThan: 2,
    lessThanEq: 2,
    greaterThan: 2,
    greaterThanEq: 2,
    and: 2,
    or: 2,
    xor: 2,
    max: 2,
    min: 2,
    abs: 1,
    floor: 1,
    ceil: 1,
    rand: 1
}

export const commands = {
    reset: 0, greg: 1, sreg: 2, const: 3,
    op: 4, opa: 5, addi: 6, cpy: 7,
    jmp: 8, jmpi: 9, jeqi: 10, jnei: 11,
    read: 12, write: 13, reads: 14, writes: 15,
    loop: 16, call: 17, ret: 18,
    loadLocal: 19, saveLocal: 20, loadArg: 21,
    int: 22, halt: 23,
    in: 24, out: 25, ini: 26, outi: 27
}

const diskOffset = 256 - 12
const memoryOffset = diskOffset - 6

export const components = {
    d: {
        op: diskOffset,
        fileId: diskOffset + 1,
        ret: diskOffset + 2,
        dataLen: diskOffset + 3,
        dataAddr: diskOffset + 4,
        nameLen: diskOffset + 5,
        nameAddr: diskOffset + 6,
        files: diskOffset + 7,
        filesCap: diskOffset + 8,
        free: diskOffset + 9,
        total: diskOffset + 10,
        halt: diskOffset + 11
    },
    i: 256,
    m: {
        enable: memoryOffset,
        src: memoryOffset + 1,
        fromComponent: memoryOffset + 2,
        dst: memoryOffset + 3,
        len: memoryOffset + 4,
        target: memoryOffset + 5,
        t: {
            memory: 0,
            input: 1,
            component: 2
        }
    }
}

export const macros = {
    saddr(line, [_, data], writeLine){
        if(data !== void 0) writeLine(commands.const, +data)
        writeLine(commands.sreg, registers.address)
    },
    inc(line, [], writeLine){
        writeLine(commands.addi, 1)
    },
    dec(line, [], writeLine){
        writeLine(commands.addi, -1)
    },
    ainc(line, [], writeLine){
        writeLine(commands.greg, registers.address)
        writeLine(commands.addi, 1)
        writeLine(commands.sreg, registers.address)
    },
    adec(line, [], writeLine){
        writeLine(commands.greg, registers.address)
        writeLine(commands.addi, -1)
        writeLine(commands.sreg, registers.address)
    },
    def(line, [_, label, locals], writeLine, ptr, labels){
        labels[label] = ptr
        writeLine(commands.greg, registers.sp)
        writeLine(commands.cpy)
        writeLine(commands.sreg, registers.locals)
        writeLine(commands.addi, +locals)
        writeLine(commands.sreg, registers.sp)
    },
    call(line, [_, label, args], writeLine, ptr, labels){
        writeLine(commands.const, +args)
        writeLine(commands.call, label)
    },
    ptr(line, [_ ,ptr]){
        return +ptr
    },
    pad(line, [_ ,ptr], writeLine, p, labels){
        for(let i = 0; i < ptr - p; i++){
            writeLine(0)
        }
    },
    data(line, [_, num, d], writeLine, ptr, labels, g, s, gd){
        if(d != void 0){
            labels[num] = ptr
            num = d
        }
        writeLine(gd(num) , 0)
    },
    str(line, [_, label, ...str], writeLine, ptr, labels){
        if(!label.startsWith("\"")) labels[label] = ptr
        else str.unshift(label)
        for(const chr of eval(str.join(" "))){
            writeLine(chr.charCodeAt(0))
        }
    },
    strl(line, [_, label, ...str], writeLine, ptr, labels){
        if(!label.startsWith("\"")) labels[label] = ptr
        else str.unshift(label)
        const s = eval(str.join(" "))
        writeLine(s.length)
        for(const chr of s){
            writeLine(chr.charCodeAt(0))
        }
    },
    program(){
        return 0
    },
    name(line, [_, ...str], writeLine, ptr, labels, g, set){
        const s = eval(str.join(" "))
        writeLine(s.length)
        for(const chr of s){
            writeLine(chr.charCodeAt(0))
        }
        for(let i = 0; i < 16 + (15 - s.length); i++){
            writeLine(0)
        }
    },
    version(line, [_, min, max], writeLine, ptr, labels, g, s){
        const out = g()
        s(out
            .replace("write 0 bank1 17", "write "+min+" bank1 17")
            .replace("write 0 bank1 18", "write "+(max ?? -1)+" bank1 18"))
    },
    endProgram(line, [_, ...str], writeLine, ptr, labels, g, s){
        const len = ptr - 32
        const out = g()
        s(out
            .replace("write 0 bank1 16", "write "+len+" bank1 16")
            .replace("write 0 bank1 31", "write @time bank1 31"))
    },
    waitState(line, [_, target, value], writeLine, ptr){
        writeLine(commands.ini, target)
        writeLine(commands.const, value)
        writeLine(commands.op, 8)
        writeLine(commands.jnei, ptr)
    },
    waitStateNe(line, [_, target, value], writeLine, ptr){
        writeLine(commands.ini, target)
        writeLine(commands.const, value)
        writeLine(commands.op, 7)
        writeLine(commands.jnei, ptr)
    },
    phalt(line, [_, target], writeLine){
        writeLine(commands.const, 1)
        writeLine(commands.outi, ".d.halt")
        if(target){
            writeLine(commands.const, 1)
            writeLine(commands.outi, target)
        }
        writeLine(commands.halt)
        writeLine(commands.const, 0)
        writeLine(commands.outi, ".d.halt")
    },
    set(line, [_, target, value], writeLine){
        writeLine(commands.const, value)
        writeLine(commands.outi, target)
    },
    printStr(line, [_, label, len], writeLine){
        writeLine(commands.const, label)
        writeLine(commands.outi, ".m.src")
        writeLine(commands.const, 2)
        writeLine(commands.outi, ".m.dst")
        writeLine(commands.const, len)
        writeLine(commands.outi, ".m.len")
        writeLine(commands.const, ".m.t.input")
        writeLine(commands.outi, ".m.target")
        writeLine(commands.const, 1)
        writeLine(commands.outi, ".m.enable")
        const ptr = writeLine(commands.ini, ".m.enable")
        writeLine(commands.const, 0)
        writeLine(commands.op, 8)
        writeLine(commands.jnei, ptr)
        writeLine(commands.const, 0)
        writeLine(commands.outi, ".m.target")
    },
    printStrl(line, [_, label], writeLine){
        writeLine(commands.const, label)
        writeLine(commands.addi, 1)
        writeLine(commands.outi, ".m.src")
        writeLine(commands.const, 2)
        writeLine(commands.outi, ".m.dst")
        writeLine(commands.reads, label)
        writeLine(commands.outi, ".m.len")
        writeLine(commands.const, ".m.t.input")
        writeLine(commands.outi, ".m.target")
        writeLine(commands.const, 1)
        writeLine(commands.outi, ".m.enable")
        const ptr = writeLine(commands.ini, ".m.enable")
        writeLine(commands.const, 0)
        writeLine(commands.op, 8)
        writeLine(commands.jnei, ptr)
        writeLine(commands.const, 0)
        writeLine(commands.outi, ".m.target")
    },
}

Object.entries(operations).forEach(([key, value], index) => {
    if(key == "add") return macros[key] = function(line, [_, data], writeLine, p, l, g, s, gd){
        if(data !== void 0) return writeLine(commands.addi, gd(data))
        writeLine(commands.op, index)
    }
    macros[key] = function(line, [_, data], writeLine, p, l, g, s, gd){
        if(data !== void 0) writeLine(commands.const, gd(data))
        writeLine(value == 0? commands.opa: commands.op, index)
    }
})

Object.entries({
    jeq: 1, jne: 2,
    jlt: 3, jle: 4,
    jgt: 5, jge: 6
}).forEach(([key, value]) => {
    macros[key] = function(line, [_, data], writeLine, p, l, g, s, gd){
        if(data !== void 0) writeLine(commands.const, gd(data))
        writeLine(commands.jmp, value)
    }
})