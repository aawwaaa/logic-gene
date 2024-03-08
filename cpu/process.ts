import { commands, cpuRegisters, macros } from "./constants"
import { readdirSync, writeFileSync, readFileSync } from "fs"

export function process(){
    for(const file of readdirSync("./cpu/codes")){
        const data = readFileSync("./cpu/codes/"+file).toString()
        const context = new CompileContext(file, data)
        const result = context.compile()
        for(const index in result){
            writeFileSync("./cpu/outs/"+file+"."+index, result[index])
        }
    }
    console.log("compile complete!")
}

const keywords: Record<string, Keyword> = {
    "define": (context: CompileContext, line: string) => {
        const [_1, name, ...value] = line.split(" ")
        context.defines[name] = value.join(" ")
    },
    "addr": (context: CompileContext, line: string) => {
        const [_1, addr, ...next] = line.split(" ")
        const label = new AddressLabel(context.currentRegion, +addr)
        context.appendNode(label)
        context.line -= 1
        context.processLine(next.join(" "))
    },
    "macro": (context: CompileContext, line: string) => {
        const [_1, name, ...others] = line.split(" ")
        const {args, returnArgs} = context.parseArgs(others.join(" "))
        const lines: string[] = []
        while(context.lines[context.line] != "endmacro"){
            lines.push(context.lines[context.line])
            context.line += 1
            if(context.lines.length == context.line){
                console.log("SyntaxError: Expected 'endmacro' but not found" + context.getError(context.line))
                break
            }
        }
        context.line += 1
        context.macros[name] = (context, node) => {
            context.lines.splice(context.line, 0, ...lines.map(line => line.split(" ")
                .map(a => args.includes(a)? node.args[args.indexOf(a)]: 
                returnArgs.includes(a)? node.returnArgs[returnArgs.indexOf(a)]: a).join(" ")))
                context.displayLineOffset -= lines.length
        }
    },
    "func": (context: CompileContext, line: string) => {
        const [_1, name, ...others] = line.split(" ")
        const {args, returnArgs} = context.parseArgs(others.join(" "))
        const lines: string[] = []
        while(context.lines[context.line] != "endfunc"){
            lines.push(context.lines[context.line])
            context.line += 1
            if(context.lines.length == context.line){
                console.log("SyntaxError: Expected 'endfunc' but not found" + context.getError(context.line))
                break
            }
        }
        context.lines[context.line] = ""
        context.line -= lines.length
        const region = context.newRegion(name)
        region.funcArgs = args
        region.funcLocals = returnArgs
        context.appendNode("funcinit", [returnArgs.length.toString()], [])
    },
    "data": (context: CompileContext, line: string) => {
        const [_1, ...others] = line.split(" ")
        context.appendNode(new DataNode(context.currentRegion, others))
    },
    "pad": (context: CompileContext, line: string) => {
        const [_1, len, ...others] = line.split(" ")
        context.appendNode(new PadNode(context.currentRegion, len))
    },
    "str": (context: CompileContext, line: string) => {
        const [_1, ...others] = line.split(" ")
        const str: string = eval(others.join(" "))
        context.appendNode(new DataNode(context.currentRegion, new Array(str.length).fill(0)
            .map((_1, i) => str.charCodeAt(i).toString())))
    },
    "mulstr": (context: CompileContext, line: string) => {
        const lines: string[] = []
        while(context.lines[context.line] != "endmulstr"){
            lines.push(context.lines[context.line])
            context.line += 1
            if(context.lines.length == context.line){
                console.log("SyntaxError: Expected 'endmulstr' but not found" + context.getError(context.line))
                break
            }
        }
        context.line += 1
        const str = lines.join("\n")
        context.appendNode(new DataNode(context.currentRegion, new Array(str.length).fill(0)
            .map((_1, i) => str.charCodeAt(i).toString())))
    },
}

export class CompileContext{
    datas: Record<number, number> = {}
    commits: Record<number, string> = {}
    dataPointer: number = 0

    file: string
    lines: string[] = []
    line: number = 0

    displayLineOffset: number = 0

    defines: Record<string, string> = {}
    labels: Record<string, Node> = {}
    macros: Record<string, Macro> = {}

    regions: Region[] = []
    currentRegion: Region

    waitForNodePromises: ((node: Node) => void)[] = []

    constructor(file: string, data: string){
        this.file = file
        this.lines = data.split('\n')
        this.newRegion("default")
    }

    appendNode(node: Node): Node
    appendNode(name: string, args: string[], returnArgs: string[]): Node
    appendNode(...args: any): any{
        return this.currentRegion.appendNode.apply(this.currentRegion, args)
    }

    newRegion(name: string){
        this.currentRegion = new Region(name)
        this.labels[name] = this.currentRegion
        this.currentRegion.line = this.line
        this.regions.push(this.currentRegion)
        return this.currentRegion
    }

    compile(): string[]{
        while(this.lines[this.line] != void 0){
            this.processLine()
        }
        this.processNames()
        this.preFillData()
        this.fillData()
        return this.generateCode()
    }

    processLine(line = this.lines[this.line]){
        if(line == void 0) return
        if(line.endsWith("\\")){
            this.line += 1;
            const content = line.substring(0, line.length - 1)
                + this.lines[this.line]
            this.processLine(content)
            return
        }
        line = line.trim()
        const firstTokenName = line.split(" ")[0]
        if(firstTokenName.length == 0 || firstTokenName.startsWith(";")){
            this.line += 1;
            return
        }
        if(keywords.hasOwnProperty(firstTokenName)){
            this.line += 1;
            keywords[firstTokenName](this, line)
            return
        }
        if(firstTokenName.endsWith(":")){
            const labelName = firstTokenName.split(":")[0]
            const left = line.substring(firstTokenName.length)
            if(firstTokenName.endsWith("::")){
                const label = new Label(this.currentRegion, labelName)
                label.line = this.line
                this.appendNode(label)
                this.currentRegion.localLabels[labelName] = label
            }else{
                this.newRegion(labelName)
            }
            this.processLine(left)
            return
        }
        const commitBegin = line.indexOf(";") != -1? line.indexOf(";"): line.length
        const withoutCommits = line.split(" ").slice(1).join(" ").substring(0, commitBegin)
        const {args, returnArgs} = this.parseArgs(withoutCommits)
        const node = new Node(this.currentRegion, firstTokenName, args, returnArgs)
        node.line = this.line + 1;
        if(macros.hasOwnProperty(firstTokenName)){
            const macro = macros[firstTokenName]
            this.line += 1;
            macro(this, node)
            return
        }
        if(this.macros.hasOwnProperty(firstTokenName)){
            const macro = this.macros[firstTokenName]
            this.line += 1;
            macro(this, node)
            return
        }
        if(commands.includes(firstTokenName)){
            this.line += 1;
            this.appendNode(node)
            return
        }
        console.error("InstructionError: Unknown command: " + firstTokenName + this.getError(node.line))
        this.line += 1;
    }

    parseArgs(text: string): {args: string[], returnArgs: string[]}{
        const [args, returnArgs] = text.split("->").map(a => a.trim().split(",").map(a => a.trim()).filter(a => a))
        return {args, returnArgs: returnArgs ?? []}
    }

    getError(line: number): string{
        return " in file "+this.file+" line "+(line+this.displayLineOffset)
    }

    processNames(){
        for(const region of this.regions){
            region.processNames(this)
        }
    }

    preFillData(){
        for(const region of this.regions){
            region.preFillData(this)
        }
    }

    fillData(){
        for(const region of this.regions){
            region.fillData(this)
        }
    }

    generateCode(): string[]{
        const codes: string[] = []
        let currentCode = ""
        let lines = 0
        for(const index in this.datas){
            const bank = Math.floor(+index / 512) + 1
            const addr = +index % 512
            currentCode += "write " + this.datas[index] + " bank" + bank + " " + addr + "\n"
            lines += 1
            if(lines >= 999){
                codes.push(currentCode)
                currentCode = ""
                lines = 0
            }
            if(this.commits[index]){
                const splited = this.commits[index].split("\n")
                currentCode += splited.map(a => "# "+a).join("\n") + "\n"
                lines += splited.length
                if(lines >= 999){
                    codes.push(currentCode)
                    currentCode = ""
                    lines = lines - 999
                }
            }
        }
        if(currentCode.length > 0){
            codes.push(currentCode)
        }
        return codes
    }
}

type Keyword = (context: CompileContext, line: string) => Promise<Node> | void
export type Macro = (context: CompileContext, node: Node) => Node | void

class Node{
    dataBegin: number = -1
    promises: ((num: number) => void)[] = []

    region: Region
    line: number

    name: string
    args: string[]
    returnArgs: string[]

    arg1: number = 0
    arg2: number = 0
    ret: number = 0
    usedConst: boolean = false
    const: string = ""

    constructor(region: Region, name: string, args: string[], returnArgs: string[]){
        this.region = region
        this.name = name
        this.args = args
        this.returnArgs = returnArgs
    }

    getMark(handler: (dataBegin: number) => void): void{
        if(this.dataBegin != -1) handler(this.dataBegin)
        else this.promises.push(handler)
    }

    setConst(context: CompileContext, value: string){
        if(this.usedConst){
            console.log("ValueError: Register const has already used" + context.getError(this.line))
            return cpuRegisters.const
        }
        this.usedConst = true
        this.const = value
    }

    getData(context: CompileContext, name: string): number{
        name = name.trim()
        if(context.defines.hasOwnProperty(name)) name = context.defines[name]
        if(!isNaN(+name)){
            return +name
        }
        if(name.startsWith("&")){
            const label = this.region.localLabels[name.substring(1)]
                ?? context.labels[name.substring(1)]
            if(!label){
                console.log("ValueError: Label not found: "+ name + context.getError(this.line))
                return
            }
            return label.dataBegin
        }
        return -1
    }

    getValue(context: CompileContext, name: string): number{
        if(context.defines.hasOwnProperty(name)) name = context.defines[name]
        if(Number.isInteger(+name)){
            this.setConst(context, name)
            return cpuRegisters.const
        }
        if(!isNaN(+name)){
            console.log("ValueError: Float not supported" + context.getError(this.line))
            return cpuRegisters.const
        }
        if(name.startsWith("&")){
            const label = this.region.localLabels[name.substring(1)]
                ?? context.labels[name.substring(1)]
            if(!label){
                console.log("ValueError: Label not found: "+ name + context.getError(this.line))
                return cpuRegisters.const
            }
            this.setConst(context, "0")
            label.getMark(dataBegin => {
                this.const = dataBegin.toString()
            })
            return cpuRegisters.const
        }
        if(cpuRegisters.hasOwnProperty(name)) return cpuRegisters[name]
        if(this.region.funcArgs.includes(name)){
            this.setConst(context, this.region.funcArgs.indexOf(name).toString())
            return cpuRegisters.const
        }
        if(this.region.funcLocals.includes(name)){
            this.setConst(context, this.region.funcLocals.indexOf(name).toString())
            return cpuRegisters.const
        }
        return 0
    }

    processNames(context: CompileContext){
        this.args.forEach((arg, index) => {
            const value = this.getValue(context, arg)
            if(index == 0) this.arg1 = value;
            else if(index == 1)  this.arg2 = value;
            else{
                console.log("ValueError: Too many arguments" + context.getError(this.line))
                return
            }
        })
        this.returnArgs.forEach((arg, index) => {
            const value = this.getValue(context, arg)
            if(index == 0) this.ret = value;
            else{
                console.log("ValueError: Too many return arguments" + context.getError(this.line))
                return
            }
        })
    }

    setDataBegin(dataBegin: number){
        if(this.dataBegin != -1) return
        this.dataBegin = dataBegin
        while(this.promises.length > 0){
            this.promises.shift()(this.dataBegin)
        }
    }

    preFillData(context: CompileContext): number{
        this.setDataBegin(context.dataPointer)
        return 1
    }

    fillData(context: CompileContext): number{
        let command = commands.indexOf(this.name)
        command |= this.arg1 << (6+8)
        command |= this.arg2 << (6+4)
        command |= this.ret << (6+0)
        if(this.usedConst){
            if(+this.const < 0) command = -command
            const constValue = this.getData(context, this.const) * (1 << 6+12)
            command += constValue
        }
        context.datas[context.dataPointer] = command
        return 1
    }
}

class Label extends Node{
    constructor(region: Region, name: string){
        super(region, name, [], [])
    }

    preFillData(context: CompileContext): number{
        this.setDataBegin(context.dataPointer)
        return 0
    }

    fillData(context: CompileContext): number{
        return 0
    }
}

class Region extends Node{
    localLabels: Record<string, Node> = {}
    funcArgs: string[] = []
    funcLocals: string[] = []
    nodes: Node[] = []

    constructor(name: string){
        super(null, name, [], [])
        this.region = this
    }

    appendNode(node: Node): Node
    appendNode(name: string, args: string[], returnArgs: string[]): Node
    appendNode(name: string | Node, args?: string[], returnArgs?: string[]){
        if(name instanceof Node){
            this.nodes.push(name)
            return Node
        }
        const node = new Node(this, name, args, returnArgs)
        this.nodes.push(node)
        return node
    }

    processNames(context: CompileContext){
        this.nodes.forEach(node => {
            node.processNames(context)
        })
    }

    preFillData(context: CompileContext): number {
        let total = 0
        this.setDataBegin(context.dataPointer)
        this.nodes.forEach(node => {
            const len = node.preFillData(context)
            context.dataPointer += len
            total += len
        })
        return total
    }

    fillData(context: CompileContext): number {
        let total = 0
        const regionCommit = "region " + this.name + "\n"
            + Object.keys(this.localLabels).join(" ") + "\n"
        this.nodes.forEach((node, i) => {
            context.commits[context.dataPointer] = "node " + node.name + " [" + node.args + "] -> [" + node.returnArgs + "]\n"
                + node.arg1 + "\t" + node.arg2 + "\t" + node.ret + "\t" + node.const + "\t" + node.getData(context, node.const)
            if(i == 0) context.commits[context.dataPointer] = regionCommit + context.commits[context.dataPointer]
            const len = node.fillData(context)
            context.dataPointer += len
            total += len
        })
        return total
    }
}

class AddressLabel extends Label{
    address: number

    constructor(region: Region, address: number){
        super(region, "__address")
        this.address = address
    }

    preFillData(context: CompileContext): number{
        this.setDataBegin(context.dataPointer)
        context.dataPointer = this.address
        return 0
    }

    fillData(context: CompileContext): number{
        context.dataPointer = this.address
        return 0
    }
}

class DataNode extends Node{
    data: string[]

    constructor(region: Region, data: string[]){
        super(region, "__data", [], [])
        this.data = data
    }

    preFillData(context: CompileContext): number{
        this.setDataBegin(context.dataPointer)
        return this.data.length
    }

    fillData(context: CompileContext): number{
        this.data.forEach((data, index) => {
            context.datas[context.dataPointer + index] = this.getData(context, data)
        })
        return this.data.length
    }
}

class PadNode extends Node{
    data: string

    constructor(region: Region, pad: string){
        super(region, "__data", [], [])
        this.data = pad
    }

    preFillData(context: CompileContext): number{
        this.setDataBegin(context.dataPointer)
        return +this.data
    }

    fillData(context: CompileContext): number{
        return +this.data
    }
}
