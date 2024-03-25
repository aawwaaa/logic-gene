let i = 0
let buffer: Line[] = []
let _noprint = false

export type Value<T> = T | Var<T>

const opTypes = ["abs", "acos", "add", "and", "angle", "angleDiff", "asin", "atan", "ceil", "cos", "div", "opEqual", "floor", "opGreaterThan", "opGreaterThanEq", "idiv", "land", "len", "opLessThan", "opLessThanEq", "log", "log10", "max", "min", "mod", "mul", "noise", "not", "opNotEqual", "or", "pow", "rand", "shl", "shr", "sin", "sqrt", "opStrictEqual", "sub", "tan", "xor"]

type opType = "abs" | "acos" | "add" | "and" | "angle" | "angleDiff" | "asin" | "atan" | "ceil" | "cos" | "div" | "equal" | "floor" | "greaterThan" | "greaterThanEq" | "idiv" | "land" | "len" | "lessThan" | "lessThanEq" | "log" | "log10" | "max" | "min" | "mod" | "mul" | "noise" | "not" | "notEqual" | "or" | "pow" | "rand" | "shl" | "shr" | "sin" | "sqrt" | "strictEqual" | "sub" | "tan" | "xor"

type item = "copper"|"lead"|"metaglass"|"graphite"|"sand"|"coal"|"titanium"|"thorium"|"scrap"|"silicon"|"plastanium"|"phase-fabric"|"surge-alloy"|"spore-pod"|"blast-compound"|"pyratite"|"beryllium"|"tungsten"|"oxide"|"carbide"|"fissile-matter"|"dormant-cyst"
type liquid = "water"|"slag"|"oil"|"cryofluid"|"neoplasm"|"arkycite"|"gallium"|"ozone"|"hydrogen"|"nitrogen"|"cyanogen"
type unitType = "dagger"|"mace"|"fortress"|"scepter"|"reign"|"nova"|"pulsar"|"quasar"|"vela"|"corvus"|"crawler"|"atrax"|"spiroct"|"arkyid"|"toxopid"|"flare"|"horizon"|"zenith"|"antumbra"|"eclipse"|"mono"|"poly"|"mega"|"quad"|"oct"|"risso"|"minke"|"bryde"|"sei"|"omura"|"retusa"|"oxynoe"|"cyerce"|"aegires"|"navanax"|"alpha"|"beta"|"gamma"|"stell"|"locus"|"precept"|"vanquish"|"conquer"|"merui"|"cleroi"|"anthicus"|"anthicus-missile"|"tecta"|"collaris"|"elude"|"avert"|"obviate"|"quell"|"quell-missile"|"disrupt"|"disrupt-missile"|"renale"|"latum"|"evoke"|"incite"|"emanate"|"block"|"manifold"|"assembly-drone"|"scathe-missile"|"turret-unit-build-tower"
type statusEffect = "none"|"burning"|"freezing"|"unmoving"|"slow"|"wet"|"muddy"|"melting"|"sapped"|"electrified"|"spore-slowed"|"tarred"|"overdrive"|"overclock"|"shielded"|"boss"|"shocked"|"blasted"|"corroded"|"disarmed"|"invincible"
type block = "air"|"spawn"|"cliff"|"build1"|"build2"|"build3"|"build4"|"build5"|"build6"|"build7"|"build8"|"build9"|"build10"|"build11"|"build12"|"build13"|"build14"|"build15"|"build16"|"deep-water"|"shallow-water"|"tainted-water"|"deep-tainted-water"|"darksand-tainted-water"|"sand-water"|"darksand-water"|"tar"|"pooled-cryofluid"|"molten-slag"|"space"|"empty"|"stone"|"crater-stone"|"char"|"basalt"|"hotrock"|"magmarock"|"sand-floor"|"darksand"|"dirt"|"mud"|"dacite"|"rhyolite"|"rhyolite-crater"|"rough-rhyolite"|"regolith"|"yellow-stone"|"carbon-stone"|"ferric-stone"|"ferric-craters"|"beryllic-stone"|"crystalline-stone"|"crystal-floor"|"yellow-stone-plates"|"red-stone"|"dense-red-stone"|"red-ice"|"arkycite-floor"|"arkyic-stone"|"rhyolite-vent"|"carbon-vent"|"arkyic-vent"|"yellow-stone-vent"|"red-stone-vent"|"crystalline-vent"|"redmat"|"bluemat"|"grass"|"salt"|"snow"|"ice"|"ice-snow"|"shale"|"moss"|"core-zone"|"spore-moss"|"stone-wall"|"spore-wall"|"dirt-wall"|"dacite-wall"|"ice-wall"|"snow-wall"|"dune-wall"|"regolith-wall"|"yellow-stone-wall"|"rhyolite-wall"|"carbon-wall"|"ferric-stone-wall"|"beryllic-stone-wall"|"arkyic-wall"|"crystalline-stone-wall"|"red-ice-wall"|"red-stone-wall"|"red-diamond-wall"|"sand-wall"|"salt-wall"|"shrubs"|"shale-wall"|"spore-pine"|"snow-pine"|"pine"|"white-tree-dead"|"white-tree"|"spore-cluster"|"redweed"|"pur-bush"|"yellowcoral"|"boulder"|"snow-boulder"|"shale-boulder"|"sand-boulder"|"dacite-boulder"|"basalt-boulder"|"carbon-boulder"|"ferric-boulder"|"beryllic-boulder"|"yellow-stone-boulder"|"arkyic-boulder"|"crystal-cluster"|"vibrant-crystal-cluster"|"crystal-blocks"|"crystal-orbs"|"crystalline-boulder"|"red-ice-boulder"|"rhyolite-boulder"|"red-stone-boulder"|"metal-floor"|"metal-floor-damaged"|"metal-floor-2"|"metal-floor-3"|"metal-floor-4"|"metal-floor-5"|"dark-panel-1"|"dark-panel-2"|"dark-panel-3"|"dark-panel-4"|"dark-panel-5"|"dark-panel-6"|"dark-metal"|"pebbles"|"tendrils"|"ore-copper"|"ore-lead"|"ore-scrap"|"ore-coal"|"ore-titanium"|"ore-thorium"|"ore-beryllium"|"ore-tungsten"|"ore-crystal-thorium"|"ore-wall-thorium"|"ore-wall-beryllium"|"graphitic-wall"|"ore-wall-tungsten"|"graphite-press"|"multi-press"|"silicon-smelter"|"silicon-crucible"|"kiln"|"plastanium-compressor"|"phase-weaver"|"surge-smelter"|"cryofluid-mixer"|"pyratite-mixer"|"blast-mixer"|"melter"|"separator"|"disassembler"|"spore-press"|"pulverizer"|"coal-centrifuge"|"incinerator"|"silicon-arc-furnace"|"electrolyzer"|"atmospheric-concentrator"|"oxidation-chamber"|"electric-heater"|"slag-heater"|"phase-heater"|"heat-redirector"|"heat-router"|"slag-incinerator"|"carbide-crucible"|"slag-centrifuge"|"surge-crucible"|"cyanogen-synthesizer"|"phase-synthesizer"|"heat-reactor"|"copper-wall"|"copper-wall-large"|"titanium-wall"|"titanium-wall-large"|"plastanium-wall"|"plastanium-wall-large"|"thorium-wall"|"thorium-wall-large"|"phase-wall"|"phase-wall-large"|"surge-wall"|"surge-wall-large"|"door"|"door-large"|"scrap-wall"|"scrap-wall-large"|"scrap-wall-huge"|"scrap-wall-gigantic"|"thruster"|"beryllium-wall"|"beryllium-wall-large"|"tungsten-wall"|"tungsten-wall-large"|"blast-door"|"reinforced-surge-wall"|"reinforced-surge-wall-large"|"carbide-wall"|"carbide-wall-large"|"shielded-wall"|"mender"|"mend-projector"|"overdrive-projector"|"overdrive-dome"|"force-projector"|"shock-mine"|"radar"|"build-tower"|"regen-projector"|"shockwave-tower"|"shield-projector"|"large-shield-projector"|"conveyor"|"titanium-conveyor"|"plastanium-conveyor"|"armored-conveyor"|"junction"|"bridge-conveyor"|"phase-conveyor"|"sorter"|"inverted-sorter"|"router"|"distributor"|"overflow-gate"|"underflow-gate"|"mass-driver"|"duct"|"armored-duct"|"duct-router"|"overflow-duct"|"underflow-duct"|"duct-bridge"|"duct-unloader"|"surge-conveyor"|"surge-router"|"unit-cargo-loader"|"unit-cargo-unload-point"|"mechanical-pump"|"rotary-pump"|"impulse-pump"|"conduit"|"pulse-conduit"|"plated-conduit"|"liquid-router"|"liquid-container"|"liquid-tank"|"liquid-junction"|"bridge-conduit"|"phase-conduit"|"reinforced-pump"|"reinforced-conduit"|"reinforced-liquid-junction"|"reinforced-bridge-conduit"|"reinforced-liquid-router"|"reinforced-liquid-container"|"reinforced-liquid-tank"|"power-node"|"power-node-large"|"surge-tower"|"diode"|"battery"|"battery-large"|"combustion-generator"|"thermal-generator"|"steam-generator"|"differential-generator"|"rtg-generator"|"solar-panel"|"solar-panel-large"|"thorium-reactor"|"impact-reactor"|"beam-node"|"beam-tower"|"beam-link"|"turbine-condenser"|"chemical-combustion-chamber"|"pyrolysis-generator"|"flux-reactor"|"neoplasia-reactor"|"mechanical-drill"|"pneumatic-drill"|"laser-drill"|"blast-drill"|"water-extractor"|"cultivator"|"oil-extractor"|"vent-condenser"|"cliff-crusher"|"plasma-bore"|"large-plasma-bore"|"impact-drill"|"eruption-drill"|"core-shard"|"core-foundation"|"core-nucleus"|"core-bastion"|"core-citadel"|"core-acropolis"|"container"|"vault"|"unloader"|"reinforced-container"|"reinforced-vault"|"duo"|"scatter"|"scorch"|"hail"|"wave"|"lancer"|"arc"|"parallax"|"swarmer"|"salvo"|"segment"|"tsunami"|"fuse"|"ripple"|"cyclone"|"foreshadow"|"spectre"|"meltdown"|"breach"|"diffuse"|"sublimate"|"titan"|"disperse"|"afflict"|"lustre"|"scathe"|"smite"|"malign"|"ground-factory"|"air-factory"|"naval-factory"|"additive-reconstructor"|"multiplicative-reconstructor"|"exponential-reconstructor"|"tetrative-reconstructor"|"repair-point"|"repair-turret"|"tank-fabricator"|"ship-fabricator"|"mech-fabricator"|"tank-refabricator"|"mech-refabricator"|"ship-refabricator"|"prime-refabricator"|"tank-assembler"|"ship-assembler"|"mech-assembler"|"basic-assembler-module"|"unit-repair-tower"|"payload-conveyor"|"payload-router"|"reinforced-payload-conveyor"|"reinforced-payload-router"|"payload-mass-driver"|"large-payload-mass-driver"|"small-deconstructor"|"deconstructor"|"constructor"|"large-constructor"|"payload-loader"|"payload-unloader"|"power-source"|"power-void"|"item-source"|"item-void"|"liquid-source"|"liquid-void"|"payload-source"|"payload-void"|"heat-source"|"illuminator"|"legacy-mech-pad"|"legacy-unit-factory"|"legacy-unit-factory-air"|"legacy-unit-factory-ground"|"command-center"|"launch-pad"|"interplanetary-accelerator"|"message"|"switch"|"micro-processor"|"logic-processor"|"hyper-processor"|"memory-cell"|"memory-bank"|"logic-display"|"large-logic-display"|"canvas"|"reinforced-message"|"world-processor"|"world-cell"|"world-message"|"solid"
type prop = "totalLiquids"|"itemCapacity"|"shooting"|"firstItem"|"powerNetStored"|"type"|"maxHealth"|"efficiency"|"powerNetOut"|"boosting"|"mining"|"shootY"|"shootX"|"powerCapacity"|"size"|"name"|"totalPower"|"heat"|"flag"|"color"|"range"|"dead"|"speed"|"enabled"|"powerNetIn"|"settable"|"mineX"|"payloadType"|"mineY"|"ammoCapacity"|"timescale"|"table"|"powerNetCapacity"|"totalItems"|"controller"|"ammo"|"rotation"|"health"|"team"|"controlled"|"senseable"|"x"|"progress"|"y"|"payloadCount"|"config"|"liquidCapacity"|"id"

function tempVarName() {
    return "temp" + i++
}

export class Line {
    lineNumber: number
    str: string

    constructor(str: string) {
        this.str = str
        this.lineNumber = buffer.length
        buffer.push(this)
    }

    toString() {
        return this.str
    }

    jump(condition: Condition) {
        new Line("jump " + this.lineNumber + " " + condition.get())
    }

    next(){
        return buffer[this.lineNumber + 1]
    }

    prev(){
        return buffer[this.lineNumber - 1]
    }

    static getLength(){
        return buffer.length
    }
}

new Line("set logic_generator_by \"zzz\"")

export class Condition {
    v1: string
    code: string
    v2: string

    constructor(v1: string, v2: string, code: string) {
        this.v1 = v1
        this.v2 = v2
        this.code = code
    }

    get() {
        return this.code + " " + this.v1 + " " + this.v2
    }
}

export class Var<T>{
    name: string

    constructor(name = tempVarName()) {
        this.name = name
        for (const type of ["equal", "notEqual", "lessThan", "lessThanEq", "greaterThan", "greaterThanEq", "strictEqual"]) {
            this[type] = function (value: Value<any>) {
                return new Condition(this.name, getValue(value), type)
            }
        }
        for (const type of opTypes){
            const opType = type.startsWith("op")?
                type.substring(2, 3).toLowerCase()+type.substring(3):
                type
            this[type] = function (value: Value<any>){
                const {name, after} = this.setN()
                new Line("op "+opType+" "+name+" "+this.getN()+" "+getValue(value))
                after()
                return this
            }
            const toType = "to"+type.substring(0, 1).toUpperCase()+type.substring(1)
            this[toType] = function (value: Value<any>, name?: string){
                const v = variable(typeof(value) == "string"? value: name)
                if(typeof(value) == "string") value = void 0
                new Line("op "+opType+" "+getValue(v)+" "+this.getN()+" "+getValue(value))
                return v
            }
        }
    }

    set<T>(value: Value<T>): Var<T> {
        const {name, after} = this.setN()
        new Line("set " + name + " " + getValue(value));
        after()
        return this
    }

    setN() {
        return {
            name: this.name,
            after: ()=>{}
        }
    }

    getN() {
        return this.name
    }

    toString(){
        return "|||VAR-"+this.getN()+"|||"
    }

    equal: (value: Value<any>) => Condition
    notEqual: (value: Value<any>) => Condition
    lessThan: (value: Value<any>) => Condition
    lessThanEq: (value: Value<any>) => Condition
    greaterThan: (value: Value<any>) => Condition
    greaterThanEq: (value: Value<any>) => Condition
    strictEqual: (value: Value<any>) => Condition

    isTrue(){
        return this.equal(true)
    }

    isFalse(){
        return this.equal(false)
    }

    abs: () => Var<number>
    acos: () => Var<number>
    add: (value: Value<number>) => Var<number>
    and: (value: Value<number>) => Var<number>
    angle: (value: Value<number>) => Var<number>
    angleDiff: (value: Value<number>) => Var<number>
    asin: () => Var<number>
    atan: () => Var<number>
    ceil: () => Var<number>
    cos: () => Var<number>
    div: (value: Value<number>) => Var<number>
    opEqual: (value: Value<any>) => Var<boolean>
    floor: () => Var<number>
    opGreaterThan: (value: Value<number>) => Var<boolean>
    opGreaterThanEq: (value: Value<number>) => Var<boolean>
    idiv: (value: Value<number>) => Var<number>
    land: (value: Value<number | boolean>) => Var<boolean>
    len:  (value: Value<string>) => Var<number>
    opLessThan: (value: Value<number>) => Var<boolean>
    opLessThanEq: (value: Value<number>) => Var<boolean>
    log: () => Var<number>
    log10: () => Var<number>
    max: (value: Value<number>) => Var<number>
    min: (value: Value<number>) => Var<number>
    mod: (value: Value<number>) => Var<number>
    mul: (value: Value<number>) => Var<number>
    noise: (value: Value<boolean>) => Var<number>
    not: () => Var<number>
    opNotEqual: (value: Value<any>) => Var<boolean>
    or: (value: Value<number | boolean>) => Var<number>
    pow: (value: Value<number>) => Var<number>
    rand: () => Var<number>
    shl: (value: Value<number>) => Var<number>
    shr: (value: Value<number>) => Var<number>
    sin: () => Var<number>
    sqrt: () => Var<number>
    opStrictEqual: (value: Value<any>) => Var<boolean>
    sub: (value: Value<number>) => Var<number>
    tan: () => Var<number>
    xor: (value: Value<number | boolean>) => Var<number>

    toAbs: (name?: string) => Var<number>
    toAcos: (name?: string) => Var<number>
    toAdd: (value: Value<number>, name?: string) => Var<number>
    toAnd: (value: Value<number>, name?: string) => Var<number>
    toAngle: (value: Value<number>, name?: string) => Var<number>
    toAngleDiff: (value: Value<number>, name?: string) => Var<number>
    toAsin: (name?: string) => Var<number>
    toAtan: (name?: string) => Var<number>
    toCeil: (name?: string) => Var<number>
    toCos: (name?: string) => Var<number>
    toDiv: (value: Value<number>, name?: string) => Var<number>
    toOpEqual: (value: Value<any>, name?: string) => Var<boolean>
    toFloor: (name?: string) => Var<number>
    toOpGreaterThan: (value: Value<number>, name?: string) => Var<boolean>
    toOpGreaterThanEq: (value: Value<number>, name?: string) => Var<boolean>
    toIdiv: (value: Value<number>, name?: string) => Var<number>
    toLand: (value: Value<boolean>, name?: string) => Var<boolean>
    toLen:  (value: Value<string>, name?: string) => Var<number>
    toOpLessThan: (value: Value<number>, name?: string) => Var<boolean>
    toOpLessThanEq: (value: Value<number>, name?: string) => Var<boolean>
    toLog: (name?: string) => Var<number>
    toLog10: (name?: string) => Var<number>
    toMax: (value: Value<number>, name?: string) => Var<number>
    toMin: (value: Value<number>, name?: string) => Var<number>
    toMod: (value: Value<number>, name?: string) => Var<number>
    toMul: (value: Value<number>, name?: string) => Var<number>
    toNoise: (value: Value<boolean>, name?: string) => Var<number>
    toNot: (name?: string) => Var<number>
    toOpNotEqual: (value: Value<any>, name?: string) => Var<boolean>
    toOr: (value: Value<number | boolean>, name?: string) => Var<number>
    toPow: (value: Value<number>, name?: string) => Var<number>
    toRand: (name?: string) => Var<number>
    toShl: (value: Value<number>, name?: string) => Var<number>
    toShr: (value: Value<number>, name?: string) => Var<number>
    toSin: (name?: string) => Var<number>
    toSqrt: (name?: string) => Var<number>
    toOpStrictEqual: (value: Value<any>, name?: string) => Var<boolean>
    toSub: (value: Value<number>, name?: string) => Var<number>
    toTan: (name?: string) => Var<number>
    toXor: (value: Value<number | boolean>, name?: string) => Var<number>
}

export class SingleResult<T> extends Line {
    constructor(str: string) {
        super(str)
    }

    get(name?: string): Var<T> {
        const v = variable(name)
        this.to(v)
        return v
    }

    to(value: Var<T>): Line {
        const {name, after} = value.setN()
        this.str = this.str.replace("$", name)
        after()
        return this
    }
}

export class SingleResultArr<T> implements Line {
    results: SingleResult<T>[]
    constructor(results: SingleResult<T>[]) {
        this.results = results
    }

    get lineNumber(){
        return this.results[0].lineNumber
    }

    get str(){
        return this.results[0].str
    }

    toString() {
        return this.str
    }

    jump(condition: Condition) {
        new Line("jump " + this.lineNumber + " " + condition.get())
    }

    next(){
        return buffer[this.lineNumber + 1]
    }

    prev(){
        return buffer[this.lineNumber - 1]
    }

    get(): Var<T> {
        const v = variable()
        this.to(v)
        return v
    }

    to(value: Var<T>): Line {
        return this.results.map(a => a.to(value))[0]
    }
}

export class MultiResult<T extends { [K: string]: any }> extends Line {
    results: (keyof T)[]

    constructor(str: string, results: (keyof T)[]) {
        super(str)
        this.results = results
    }

    packed(): ({
        [K in keyof T]: Var<T[K]>
    } & {
        line: Line
    }) {
        const vars = this.results.map(a => variable())
        const obj = {
            line: this
        } as Record<any, any>
        vars.forEach((a, i) => {
            this.to(this.results[i], a)
            obj[this.results[i]] = a
        })
        return obj as any
    }

    to<K extends keyof T>(key: K, value: Var<T[K]>): MultiResult<Omit<this extends MultiResult<infer A> ? A : never, K>> {
        const {name, after} = value.setN()
        this.str = this.str.replace("$" + key.toString(), name)
        after()
        return this as any
    }
}

export function getValue(v: Var<any> | any) {
    if(v instanceof Var) return v.getN()
    if(typeof (v) == "string"){
        v = v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
        if(v.includes('"')) return "'" + v + "'";
        else return '"' + v + '"';
    }
    return v+"";
}

export function returnValue<T>(value: Value<T>): SingleResult<T>{
    return new SingleResult("set $ "+getValue(value))
}

export class Building{}
export class Unit{}

export class Prop{
    prop: ""
}

export class Content{}

export interface Image{
    image: ""
}

export class Item extends Content implements Prop, Image{
    prop: ""
    image: ""
}
export class Liquid extends Content implements Prop, Image{
    prop: ""
    image: ""
}
export class Block extends Content implements Image{
    image: ""
}
export class UnitType extends Content implements Image{
    image: ""
}
export class StatusEffect extends Content{}

export function item(item: item): Var<Item> & Item{
    return variable("@"+item) as any
}

export function liquid(item: liquid): Var<Liquid> & Liquid{
    return variable("@"+item) as any
}

export function unitType(item: unitType): Var<UnitType> & UnitType{
    return variable("@"+item) as any
}

export function statusEffect(item: statusEffect): Var<StatusEffect> & StatusEffect{
    return variable("@"+item) as any
}

export function block(item: block): Var<Block> & Block{
    return variable("@"+item) as any
}

export function prop(item: prop): Var<Prop> & Prop{
    return variable("@"+item) as any
}

export class Color{
    str: string

    static valueOf(r: number, g: number, b: number, a: number = 1){
        const inst = new this()
        inst.str = "%"+r.toString(16).padStart(2, "0")+g.toString(16).padStart(2, "0")+b.toString(16).padStart(2, "0")+a.toString(16).padStart(2, "0")
        return inst
    }
    static color = color
    toString(){
        return this.str
    }
}

export function color(rrggbbaa: string){
    const inst = new Color()
    inst.str = "%"+rrggbbaa
    return inst
}

let vars: Record<string, Var<any>> = {}
let marks: Record<string, number> = {}

export const counter = variable<number>("@counter")
export const time = variable<number>("@time")
export const thisProcessor = variable<Building>("@this")
export const thisx = variable<number>("@thisx")
export const thisy = variable<number>("@thisy")

export const itemCount = variable<number>("@itemCount")
export const liquidCount = variable<number>("@liquidCount")
export const blockCount = variable<number>("@blockCount")
export const unitCount = variable<number>("@unitCount")

export function variable<T>(name?: string): Var<T> {
    if(name == undefined) return new Var<T>(name)
    return vars[name] ?? (vars[name] = new Var<T>(name))
}

let dvn = 0

export function dynamicVariable<T>(): [Var<T>, SingleResult<T>]{
    const name = "#"+(dvn ++)
    const v = vars[name] ?? (vars[name] = new Var<T>(name))
    return [v, {
        lineNumber: 0,
        get(name) {
            const v = variable(name)
            buffer.forEach(l => {
                const {name: n, after} = v.setN()
                l.str = l.str.replaceAll(name, n)
            })
            return v;
        },
        to(v) {
            buffer.forEach(l => {
                const {name: n, after} = v.setN()
                l.str = l.str.replaceAll(name, n)
            })
            return this;
        },
        str: "",
        jump(condition) {
            return this;
        },
        next() {
            return this;
        },
        prev() {
            return this;
        },
    }]
}

export function build<T extends Building>(name: string): Var<T>{
    return variable(name)
}

export function previusLine(){
    return buffer[buffer.length - 1]
}

export function nextLineNumber(){
    return buffer.length
}

export function makeMark(name: string) {
    marks[name] = buffer.length
    return buffer[buffer.length]
}

export const always = new Condition("0", "0", "always")

export function getResult() {
    i = 0
    vars = {}
    let str = buffer.join("\n")
    str = str.replace(/\$[^ ]*/g, a => {
        const mark = marks[a.substring(1)]
        if (mark == undefined) return a
        return mark + ""
    })
    buffer = []
    _noprint = false
    new Line("set logic_generator_by \"zzz\"")
    return str+"\nend"
}

/*
read write print draw
*/

export function read(cell: Value<Building>, address: Value<number>): SingleResult<number>{
    return new SingleResult("read $ "+getValue(cell)+" "+getValue(address))
}

export function write(cell: Value<Building>, address: Value<number>, data: Value<number | boolean>): Line{
    return new Line("write "+getValue(data)+" "+getValue(cell)+" "+getValue(address))
}

export function print(str: Value<string> | Var<any>){
    if(_noprint) return
    if(str instanceof Var) return [new Line("print "+getValue(str))]
    return str.split("|||")
        .filter(a => a)
        .map(a => new Line("print "+(a.startsWith("VAR-")?a.substring(4):getValue(a))))
}

export namespace draw{
    function func(str: string){
        return function(...args: any[]){
            return new Line("draw "+str+" "+args.map(a => getValue(a)).join(" "))
        }
    }
    
    export const clear: (r: Value<number>, g: Value<number>, b: Value<number>) => Line = func("clear")
    export const color: (r: Value<number>, g: Value<number>, b: Value<number>, a: Value<number>) => Line = func("color")
    export const col: (color: Value<Color>) => Line = func("col")
    export const stroke: (stroke: Value<number>) => Line = func("stroke")
    export const line: (x: Value<number>, y: Value<number>, x2: Value<number>, y2: Value<number>) => Line = func("line")
    export const rect: (x: Value<number>, y: Value<number>, width: Value<number>, height: Value<number>) => Line = func("rect")
    export const lineRect: (x: Value<number>, y: Value<number>, width: Value<number>, height: Value<number>) => Line = func("lineRect")
    export const poly: (x: Value<number>, y: Value<number>, sides: Value<number>, radius: Value<number>, rotation: Value<number>) => Line = func("poly")
    export const linePoly: (x: Value<number>, y: Value<number>, sides: Value<number>, radius: Value<number>, rotation: Value<number>) => Line = func("linePoly")
    export const triangle: (x: Value<number>, y: Value<number>, x2: Value<number>, y2: Value<number>, x3: Value<number>, y3: Value<number>) => Line = func("triangle")
    export const image: (x: Value<number>, y: Value<number>, image: Value<Image>, size: Value<number>, rotation: Value<number>) => Line = func("image")
}

export function noprint(noprint: boolean){
    _noprint = noprint
}

/*
printflush drawflush getlink control radar sensor
*/

export function printflush(target: Var<Building>){
    if(_noprint) return
    return new Line("printflush "+getValue(target))
}

export function drawflush(target: Var<Building>){
    return new Line("drawflush "+getValue(target))
}

export function getlink(index: Value<number>){
    return new SingleResult("getlink $ "+getValue(index))
}

export namespace controls{
    function func(str: string){
        return function(...args: any[]){
            return new Line("control "+str+" "+args.map(a => getValue(a)).join(" "))
        }
    }

    export const enabled: (build: Value<Building>, enabled: Value<boolean | number>) => Line = func("enabled")
    export const shoot: (build: Value<Building>, x: Value<number>, y: Value<number>, shoot: Value<boolean | number>) => Line = func("shoot")
    export const shootp: (build: Value<Building>, target: Value<Building | Unit>, shoot: Value<boolean | number>) => Line = func("shootp")
    export const config: (build: Value<Building>, config: Value<any>) => Line = func("config")
    export const color: (build: Value<Building>, color: Value<Color>) => Line = func("color")
}

export function control(target: Value<Building>){
    const ret = {
        enabled(enabled: Value<boolean | number>){
            return Object.assign(controls.enabled(target, enabled), this) as Line & typeof ret
        },
        shoot(x: Value<number>, y: Value<number>, shoot: Value<boolean | number>){
            return Object.assign(controls.shoot(target, x, y, shoot), this) as Line & typeof ret
        },
        shootp(shootTarget: Value<Building | Unit>, shoot: Value<boolean | number>) {
            return Object.assign(controls.shootp(target, shootTarget, shoot), this) as Line & typeof ret
        },
        config(config: Value<any>) {
            return Object.assign(controls.config(target, config), this) as Line & typeof ret
        },
        color(color: Value<Color>) {
            return Object.assign(controls.color(target, color), this) as Line & typeof ret
        }
    }
    return ret
}

type radarType = "any" | "enemy" | "ally" | "player" | "attacker" | "flying" | "boss" | "ground"
type radarSort = "distance" | "health" | "shield" | "armor" | "maxHealth"
type radarOptions = {
    type?: [radarType, radarType?, radarType?],
    sort?: radarSort,
    order?: Value<number | boolean>
}

export function radar(source: Value<Building | Unit>, options: radarOptions = {}){
    if(!options.type) options.type = ["ally"]
    if(!options.sort) options.sort = "distance"
    if(options.order == void 0) options.order = 1
    while(options.type.length < 3) options.type.push("any")
    return new SingleResult<Unit>("radar "+options.type!.join(" ")+" "+options.sort+" "+getValue(source)+" "+getValue(options.order!)+" $")
}

export function sensor(source: Value<Building | Unit | Content>, prop: Value<Prop>){
    return new SingleResult("sensor $ "+getValue(source)+" "+getValue(prop))
}

/*
set op lookup packcolor
*/

export function set<T>(variable: Var<T>, value: Value<T>){
    return new Line("set " + variable.setN() + " " + getValue(value));
}

export function operation<O = number>(op: opType, value1: Value<any>, value2: Value<any> = 0): SingleResult<O>{
    return new SingleResult("op "+op+" $ "+getValue(value1)+" "+getValue(value2))
}

export function lookup<T extends "item" | "liquid" | "block" | "unit">(type: T, index: Value<number>): SingleResult<
    T extends "item"? Item:
    T extends "liquid"? Liquid:
    T extends "block"? Block:
    T extends "unit"? UnitType:
    never
>{
    return new SingleResult("lookup "+type+" $ "+getValue(index))
}

export function packColor(r: Value<number>, g: Value<number>, b: Value<number>, a: Value<number>): SingleResult<number>{
    return new SingleResult("packcolor $ "+getValue(r)+" "+getValue(g)+" "+getValue(b)+" "+getValue(a))
}

/*
wait stop end jump
*/

export function wait(time: Value<number>){
    return new Line("wait "+getValue(time))
}

export function stop(){
    return new Line("stop")
}

export function end(){
    return new Line("end")
}

export function jumpTo(mark: string | number, condition: Condition) {
    if(typeof mark == "number") return new Line("jump "+mark+" "+condition.get())
    return new Line("jump $" + mark + " " + condition.get())
}

export function jumpMark() {
    const line = nextLineNumber()
    return {
        jumpTo(condition: Condition){
            jumpTo(line, condition)
        }
    }
}

export function jumpToAfter(condition: Condition) {
    return {
        line: new Line("jump $ " + condition.get()),
        here(): Line{
            this.line.str = this.line.str.replace("$", nextLineNumber().toString())
            return this.line
        },
        to(line: Line): Line{
            this.line.str = this.line.str.replace("$", line.lineNumber.toString())
            return this.line
        }
    }
}

/*
ubind ucontrol uradar ulocate
*/

export class UnitVar extends Var<Unit>{
    constructor(name?: string){
        super(name)
        this.controls = new BindedUnitControls(this)
        this.locates = new BindedUnitLocates(this)
    }

    bind(){
        currentUnitVar = this
        return new Line("ubind "+getValue(this))
    }

    controls: BindedUnitControls
    locates: BindedUnitLocates

    radar(options: radarOptions = {}){
        return unitRadar(this, options)
    }
}

class BindedUnitControls{
    constructor(unit: UnitVar){
        for(const key in unitControls){
            const k = key
            this[key] = function(...args: any[]){
                const ret = unitControls[k](unit, ...args)
                if(k == "getBlock" || k == "within") return ret
                return this
            }
        }
    }

    idle: () => BindedUnitControls;
    stop: () => BindedUnitControls;
    move: (x: Value<number>, y: Value<number>) => BindedUnitControls;
    approach: (x: Value<number>, y: Value<number>, radius: Value<number>) => BindedUnitControls;
    pathfind: (x: Value<number>, y: Value<number>) => BindedUnitControls;
    boost: (enable: Value<number | boolean>) => BindedUnitControls;
    target: (x: Value<number>, y: Value<number>, shoot: Value<number | boolean>) => BindedUnitControls;
    targetp: (target: Value<Unit | Building>, shoot: Value<number | boolean>) => BindedUnitControls;
    itemDrop: (target: Value<Building>, amount: Value<number>) => BindedUnitControls;
    itemTake: (from: Value<Building>, item: Value<Item>, amount: Value<number>) => BindedUnitControls;
    payDrop: () => BindedUnitControls;
    payTake: (takeUnits: Value<number>) => BindedUnitControls;
    payEnter: () => BindedUnitControls;
    mine: (x: Value<number>, y: Value<number>) => BindedUnitControls;
    flag: (flag: Value<number>) => BindedUnitControls;
    build: (x: Value<number>, y: Value<number>, block: Value<Block>, rotation: Value<number>, config: Value<any>) => BindedUnitControls;
    unbind: () => BindedUnitControls;
    getBlock: (x: Value<number>, y: Value<number>) => MultiResult<{
        type: Block,
        building: Building,
        floor: Block
    }>
    within: (x: Value<number>, y: Value<number>, radius: Value<number>) => SingleResult<boolean>
}

export function unitBind(type: Value<UnitType>): UnitVar & Line{
    const unit = new UnitVar()
    const line = new Line("ubind "+getValue(type))
    currentUnitVar = unit
    unit.set(currentUnit)
    return Object.assign(unit, line)
}

export function unitBindTo(type: Value<UnitType>, u: UnitVar): Line{
    const line = new Line("ubind "+getValue(type))
    currentUnitVar = u
    u.set(unit)
    return line
}

export namespace unitControls{
    function func(str: string){
        return function(u: UnitVar, ...args: any[]){
            let line;
            if(u != unit &&  currentUnitVar != u){
                line = u.bind()
            }
            const a = new Line("ucontrol "+str+" "+args.map(a => getValue(a)).join(" "))
            return line ?? a
        }
    }

    export const idle: (unit: UnitVar) => Line = func("idle")
    export const stop: (unit: UnitVar) => Line = func("stop")
    export const move: (unit: UnitVar, x: Value<number>, y: Value<number>) => Line = func("move")
    export const approach: (unit: UnitVar, x: Value<number>, y: Value<number>, radius: Value<number>) => Line = func("approach");
    export const pathfind: (unit: UnitVar, x: Value<number>, y: Value<number>) => Line = func("pathfind");
    export const boost: (unit: UnitVar, enable: Value<number | boolean>) => Line = func("boost");
    export const target: (unit: UnitVar, x: Value<number>, y: Value<number>, shoot: Value<number | boolean>) => Line = func("target");
    export const targetp: (unit: UnitVar, target: Value<Unit | Building>, shoot: Value<number | boolean>) => Line = func("targetp");
    export const itemDrop: (unit: UnitVar, target: Value<Building>, amount: Value<number>) => Line = func("itemDrop");
    export const itemTake: (unit: UnitVar, from: Value<Building>, item: Value<Item>, amount: Value<number>) => Line = func("itemTake");
    export const payDrop: (unit: UnitVar) => Line = func("payDrop");
    export const payTake: (unit: UnitVar, takeUnits: Value<number>) => Line = func("payTake");
    export const payEnter: (unit: UnitVar) => Line = func("payEnter");
    export const mine: (unit: UnitVar, x: Value<number>, y: Value<number>) => Line = func("mine");
    export const flag: (unit: UnitVar, flag: Value<number>) => Line = func("flag");
    export const build: (unit: UnitVar, x: Value<number>, y: Value<number>, block: Value<Block>, rotation: Value<number>, config: Value<any>) => Line = func("build");
    export const unbind: (unit: UnitVar) => Line = func("unbind");

    export function getBlock(u: UnitVar, x: Value<number>, y: Value<number>){
        if(u != unit && currentUnitVar != u){
            u.bind()
        }
        return new MultiResult<{
            type: Block,
            building: Building,
            floor: Block
        }>("ucontrol getBlock "+getValue(x)+" "+getValue(y)+" $type $building $floor", ["type", "building", "floor"])
    }
    export function within(unit: UnitVar, x: Value<number>, y: Value<number>, radius: Value<number>){
        if(unit != unit && currentUnitVar != unit){
            unit.bind()
        }
        return new SingleResult<boolean>("ucontrol within "+getValue(x)+" "+getValue(y)+" "+getValue(radius)+" $")
    }
}

export function unitRadar(u: UnitVar, options: radarOptions = {}){
    let line;
    if(u != unit &&  currentUnitVar != u){
        line = u.bind()
    }
    const a = radar(0, options)
    a.str = "u"+a.str
    return a
}

export namespace unitLocates{
    export type buildingType = "core" | "storage" | "generator" | "turret" | "factory" | "repair" | "battery" | "reactor"
    export function ore(unit: UnitVar, type: Value<Item>){
        if(unit != unit && currentUnitVar != unit){
            unit.bind()
        }
        return new MultiResult<{
            x: number,
            y: number,
            found: boolean
        }>("ulocate ore 0 0 "+getValue(type)+" $x $y $found 0", ["x", "y", "found"])
    }

    export function building(unit: UnitVar, type: buildingType, enemy: Value<boolean> = false){
        if(unit != unit && currentUnitVar != unit){
            unit.bind()
        }
        return new MultiResult<{
            x: number,
            y: number,
            found: boolean,
            building: Building
        }>("ulocate building "+type+" "+getValue(enemy)+" 0 $x $y $found $building", ["x", "y", "found", "building"])
    }

    export function spawn(u: UnitVar){
        if(u != unit && currentUnitVar != u){
            u.bind()
        }
        return new MultiResult<{
            x: number,
            y: number,
            found: boolean
        }>("ulocate spawn 0 0 0 $x $y $found 0", ["x", "y", "found"])
    }

    export function damaged(u: UnitVar){
        if(u != unit && currentUnitVar != u){
            u.bind()
        }
        return new MultiResult<{
            x: number,
            y: number,
            found: boolean,
            building: Building
        }>("ulocate damaged 0 0 0 $x $y $found $building", ["x", "y", "found", "building"])
    }
}

class BindedUnitLocates{
    constructor(unit: UnitVar){
        for(const key in unitLocates){
            const k = key
            this[key] = function(...args: any[]){
                return unitLocates[k](unit, ...args)
            }
        }
    }

    ore: (type: Value<Item>)=>MultiResult<{
        x: number,
        y: number,
        found: boolean
    }>
    building: (type: unitLocates.buildingType, enemy?: Value<number | boolean>) => MultiResult<{
        x: number,
        y: number,
        found: boolean,
        building: Building
    }>
    spawn: ()=>MultiResult<{
        x: number,
        y: number,
        found: boolean
    }>
    damaged: ()=>MultiResult<{
        x: number,
        y: number,
        found: boolean,
        building: Building
    }>
}


export const unit = new UnitVar("@unit")
export const currentUnit = unit
let currentUnitVar: UnitVar;

export const links = new Var<number>("@links")
export const mapw = new Var<number>("@mapw")
export const maph = new Var<number>("@maph")
