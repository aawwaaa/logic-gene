import { doWhileLoop, ifThen, waitState, waitStateNe, whileLoop } from "../condition";
import { Building, Condition, Value, Var, always, build, jumpMark, jumpToAfter, print, printflush, read, variable, write } from "../core";
import { stringConstantDynamic, data, stringConstant } from "../data";
import { writeFileSync } from "fs"

interface ConstantOp{
    number(num: Value<number>): void
    numberArr(...num: Value<number>[]): void
    char(num: string): void
    clearScreen(char: string): void
    cursor(row: Value<number>, col: Value<number>): void
    roll(): void
    toBuffer(enabled: Value<number | boolean>): void
    string(str: string): void
    ustring(str: string): void
}

export class DataIO{
    ptr = variable()
    _init?: {jumpTo(cond: Condition): void};
    target: Value<Building>;
    constant?: Value<Building>
    constants: string
    constantsPtr: number = 0
    op: ConstantOp

    constructor(target: Value<Building>, constant?: Value<Building>){
        this.target = target;
        this.constant = constant
        this.constants = ""
        const io = this
        this.op = {
            number(num) {
                io.constants += "write "+num+" bank1 "+(io.constantsPtr++)+"\n"
            },
            numberArr(...num: Value<number>[]){
                num.forEach(this.number.bind(this))
            },
            string(str: string){
                for(const c of str){
                    this.number(c.charCodeAt(0))
                }
            },
            ustring(str: string){
                this.string(str.toUpperCase())
            },
            char(num: string){
                this.number(num.charCodeAt(0))
            },
            clearScreen(char: string){
                this.numberArr(1, char.charCodeAt(0))
            },
            cursor(row: Value<number>, col: Value<number>){
                this.numberArr(2, row, col)
            },
            roll(){
                this.number(3)
            },
            toBuffer(enabled: Value<number | boolean>){
                this.numberArr(4, enabled as any)
            }
        }
    }

    clear(){
        this.ptr.set(0)
    }

    init(foo: ()=>void){
        const mark = jumpToAfter(always)
        this._init = jumpMark()
        this.clear()
        foo()
        mark.here()
    }

    readNoInit(idle: ()=>void = ()=>{}){
        const i = variable()
        doWhileLoop(i.notEqual(true), ()=>{
            idle()
            read(this.target, 256).to(i)
        })

        const len = read(this.target, 257).get()
        const c1 = read(this.target, 258).get()
        const c2 = read(this.target, 259).get()
        
        const contentStart = variable().set(259)
        const contentLen = len.toSub(1)
        
        ifThen(c1.equal(0x05), ()=>{
            contentStart.add(1)
            contentLen.sub(1)
        }, ()=>ifThen(c1.equal(0x1b), ()=>{
            contentStart.add(1)
            contentLen.sub(1)
        }))

        write(this.target, 256, false)

        return [c1, c2, contentStart, contentLen]
    }

    read(idle: ()=>void = ()=>{}){
        const i = variable()
        doWhileLoop(i.notEqual(true), ()=>{
            idle()
            read(this.target, 256).to(i)
        })

        const len = read(this.target, 257).get()
        const c1 = read(this.target, 258).get()
        const c2 = read(this.target, 259).get()
        
        const contentStart = variable().set(259)
        const contentLen = len.toSub(1)
        
        ifThen(c1.equal(0x05), ()=>{
            contentStart.add(1)
            contentLen.sub(1)
        }, ()=>ifThen(c1.equal(0x1b), ()=>{
            contentStart.add(1)
            contentLen.sub(1)
        }))

        write(this.target, 256, false)

        this._init?.jumpTo(c1.equal(0x06))

        return [c1, c2, contentStart, contentLen]
    }

    string(str: string){
        stringConstantDynamic(this.target, this.ptr.toAdd(2), str)
        this.ptr.add(str.length)
    }

    stringflush(str: string){
        stringConstant(this.target, 2, str)
        this.ptr.add(str.length)
        this.flush()
    }

    ustring(str: string){
        this.string(str.toUpperCase())
    }

    ustringflush(str: string){
        this.stringflush(str.toUpperCase())
    }

    number(num: Value<number>){
        write(this.target, this.ptr.toAdd(2), num)
        this.ptr.add(1)
    }

    numberArr(...num: Value<number>[]){
        num.forEach((num, i)=>write(this.target, this.ptr.toAdd(2+i), num))
        this.ptr.add(num.length)
    }

    char(num: string){
        this.number(num.charCodeAt(0))
    }

    clearScreen(char: string){
        this.numberArr(1, char.charCodeAt(0))
    }

    cursor(row: Value<number>, col: Value<number>){
        this.numberArr(2, row, col)
    }

    roll(){
        this.number(3)
    }

    toBuffer(enabled: Value<number | boolean>){
        this.numberArr(4, enabled as any)
    }

    data(cell: Value<Building>, offset: Value<number>, length: Value<number>){
        data.copy(cell, offset, this.target, this.ptr.toAdd(2), length)
        this.ptr.add(length)
    }

    useConstant(constant: [number, number]){
        this.data(this.constant, constant[0], constant[1])
    }

    defineConstant(c: (op: ConstantOp) => void): [number, number]{
        const p = this.constantsPtr
        c(this.op)
        return [p, this.constantsPtr - p]
    }

    generateConstant(filename: string){
        writeFileSync("./constants/"+filename+".txt", this.constants)
    }
    
    flush(){
        write(this.target, 1, this.ptr)
        write(this.target, 0, 1)
        const i = variable()
        doWhileLoop(i.notEqual(0), ()=>read(this.target, 0).to(i))
        this.ptr.set(0)
    }
}

export class StreamIO{
    cell: Var<Building>
    close: number
    next: number
    len: number
    begin: number

    constructor(options: {
        cell: Var<Building>,
        close: number,
        next: number,
        len: number,
        begin: number
    }){
        this.cell = options.cell
        this.close = options.close
        this.next = options.next
        this.len = options.len
        this.begin = options.begin
    }

    write(proc: (len: Var<number>, close: Var<boolean>, breaking: () => void) => void){
        const close = variable().set(false)
        const len = variable().set(0)
        write(this.cell, this.next, 0)
        write(this.cell, this.close, 0)
        whileLoop(close.equal(0), (breaking) => {
            const jumps = []
            proc(len, close, () => jumps.push(jumpToAfter(always)))
            jumps.forEach(a => a.here())
            write(this.cell, this.len, len)
            write(this.cell, this.next, 1)
            waitState(this.cell, this.next, 0)
            ifThen(close.notEqual(0), () => {
                write(this.cell, this.close, close)
                write(this.cell, this.len, 0)
                write(this.cell, this.next, 1)
                breaking()
            })
        })
    }

    read(proc: (len: Var<number>, close: Var<boolean>, breaking: () => void) => void){
        const close = variable().set(false)
        const len = variable().set(0)
        whileLoop(close.equal(0), (breaking) => {
            waitStateNe(this.cell, this.next, 0)
            read(this.cell, this.len).to(len)
            read(this.cell, this.close).to(close)
            const jumps = []
            proc(len, close, () => jumps.push(jumpToAfter(always)))
            jumps.forEach(a => a.here())
            write(this.cell, this.next, 0)
            ifThen(close.notEqual(0), () => {
                breaking()
            })
        })
        write(this.cell, this.close, 0)
    }
}