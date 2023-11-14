import { build, print, printflush, read } from "../generator/core";
import { commands, registers as regi } from "../cpu/consts";
import { switchValue } from "../generator/condition";

const registers = build("cell1")

function reg(index, name){
    print("\n["+index+"]"+name+"=")
    print(read(registers, index).get())
}

print("---registers---")
Object.entries(regi).forEach(([key, value]) => {
    reg(value, key)
})
print("\nCOMMAND=")
print(switchValue(read(registers, 62).get(), Object.keys(commands)).get())
printflush(build("message1"))