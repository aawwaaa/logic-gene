import { Macro } from "./process";

export const cpuRegisters = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
    temp: 8,
    temp2: 9,
    const: 10,
    sp: 11,
    args: 12,
    locals: 13,
    intTable: 14,
    pc: 15,
    intCall: 60,
    intCallType: 61,
    error: 62,
    enable: 63,
};

export const ops1Cmds = [
    "not",
    "floor",
    "ceil",
    "sin",
    "cos",
    "tan",
    "rand",
    "sqrt",
    "log",
    "log10",
    "abs",
];
export const jumpCond = ["jmp", "jeq", "jne", "jlt", "jle", "jgt", "jge"];

export const ops2Cmds = [
    "add",
    "sub",
    "mul",
    "div",
    "mod",
    "pow",
    "max",
    "min",
    "len",
    "angle",
    "noise",
    "and",
    "or",
    "xor",
    "shl",
    "shr",
    "equal",
    "notEqual",
    "greaterThan",
    "greaterThanEq",
    "lessThan",
    "lessThanEq",
];

export const commands = [
    "reset",
    ...new Array(16).fill(1).map((_1, index) => "mov-" + index),
    ...ops2Cmds,
    "ops1",
    "push",
    "pop",
    ...jumpCond,
    "loop",
    "call",
    "funcinit",
    "ret",
    "pushregs",
    "popregs",
    "int",
    "halt",
    "raise",
    "setlocal",
    "memcopy",
    "print",
];

export const macros: Record<string, Macro> = {
    inc(context, node) {
        node.args[1] = "1";
        node.returnArgs[0] = node.args[0];
        node.name = "add";
        context.appendNode(node);
    },
    dec(context, node) {
        node.args[1] = "1";
        node.returnArgs[0] = node.args[0];
        node.name = "sub";
        context.appendNode(node);
    },
    neg(context, node) {
        node.args[1] = "-1";
        node.returnArgs[0] = node.args[0];
        node.name = "mul";
        context.appendNode(node);
    },
    getarg(context, node) {
        if (context.currentRegion.funcArgs.includes(node.args[0]))
            node.args[0] = context.currentRegion.funcArgs
                .indexOf(node.args[0])
                .toString();
        node.args[0] = "[args+" + node.args[0] + "]";
        macros.mov(context, node);
    },
    getlocal(context, node) {
        if (context.currentRegion.funcLocals.includes(node.args[0]))
            node.args[0] = context.currentRegion.funcLocals
                .indexOf(node.args[0])
                .toString();
        node.args[0] = "[locals+" + node.args[0] + "]";
        macros.mov(context, node);
    },
    setlocal(context, node) {
        if (context.currentRegion.funcLocals.includes(node.returnArgs[0]))
            node.returnArgs[0] = context.currentRegion.funcLocals
                .indexOf(node.returnArgs[0])
                .toString();
        if (cpuRegisters.hasOwnProperty(node.args[0])) {
            node.returnArgs[0] = "[locals+" + node.returnArgs[0] + "]";
            macros.mov(context, node);
            return;
        }
        node.ret = +node.returnArgs[0];
        node.returnArgs = [];
        node.name = "setlocal";
        context.appendNode(node);
        return;
    },
    call(context, node) {
        if (!Number.isInteger(node.args[0])) {
            node.arg1 = +node.args[0];
            node.args = [];
            context.appendNode(node);
            return;
        }
        console.log(
            "InstructionError: call can only receive integer argument." +
                context.getError(context.line),
        );
    },
    mov(context, node) {
        let sourceType: number;
        if (!node.args[0].startsWith("[")) {
            sourceType = 3;
        } else {
            const text = node.args[0].substring(1, node.args[0].length - 1);
            node.args[0] = text;
            if (cpuRegisters.hasOwnProperty(text)) {
                sourceType = 2;
            } else if (text.includes("+") || text.includes("-")) {
                sourceType = 0;
                const splited = text.split(/(\+|\-)/);
                const register = isNaN(+splited[0]) ? splited[0] : splited[2];
                const number = isNaN(+splited[0]) ? splited[2] : splited[0];
                node.args[0] = register.trim();
                node.setConst(context, number.trim());
            } else {
                sourceType = 1;
            }
        }
        let targetType: number;
        if (!node.returnArgs[0].startsWith("[")) targetType = 3;
        else {
            const text = node.returnArgs[0].substring(
                1,
                node.returnArgs[0].length - 1,
            );
            node.returnArgs[0] = text;
            if (cpuRegisters.hasOwnProperty(text)) targetType = 2;
            else if (text.includes("+") || text.includes("-")) {
                targetType = 0;

                const splited = text.split(/(\+|\-)/);
                const register = isNaN(+splited[0]) ? splited[0] : splited[2];
                const number = isNaN(+splited[0]) ? splited[2] : splited[0];
                node.returnArgs[0] = register.trim();
                node.setConst(context, number.trim());
            } else targetType = 1;
        }
        const commandIndex = (sourceType << 2) | targetType;
        node.name = "mov-" + commandIndex;
        context.appendNode(node);
    },
    ...Object.fromEntries(
        ops1Cmds.map((name) => [
            name,
            (context, node) => {
                node.args[1] = ops1Cmds.indexOf(name).toString();
                node.name = "ops1";
                context.appendNode(node);
            },
        ]),
    ),
};
